import { bffFetch } from "./bff";

export const MIB = 1024 * 1024;
export const MAX_FILES_PER_DROP = 5;
export const MAX_FILE_SIZE = 10 * MIB;
export const MAX_DROP_FILE_SIZE = 20 * MIB;
export const ACTIVE_STORAGE_QUOTA = 30 * MIB;

export type CreateDropInput = {
  title: string;
  content: string;
  expires_at: string;
  max_views: number;
};

export type DropStatus = "active" | "expired" | "consumed" | "revoked";

export type Drop = {
  id: string;
  owner_id: string | null;
  title: string;
  content: string;
  expires_at: string;
  max_views: number;
  view_count: number;
  status: DropStatus;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
  last_accessed_at: string | null;
};

export type CreateDropResponse = Drop & { share_token: string };

export type PresignFileResponse = {
  file_id: string;
  upload_url: string;
  fields: Record<string, string>;
  expires_in: number;
};

export type DropFile = {
  id: string;
  original_name: string;
  content_type: string;
  size_bytes: number;
  uploaded_at: string;
};

export type UpdateDropInput = {
  title?: string;
  content?: string;
  max_views?: number;
};

export type PaginatedDrops = {
  items: Drop[];
  page: number;
  page_size: number;
  total: number;
};

export type GetDropsParams = {
  page?: number;
  page_size?: number;
  search?: string;
  status?: DropStatus;
};

export type UploadProgress =
  | { stage: "creating"; totalFiles: number }
  | {
      stage: "uploading";
      file: File;
      fileIndex: number;
      completedFiles: number;
      totalFiles: number;
    }
  | { stage: "complete"; completedFiles: number; totalFiles: number };

export class DropUploadError extends Error {
  constructor(
    message: string,
    readonly drop: CreateDropResponse,
    readonly completedFiles: number,
    readonly failedFile?: File,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "DropUploadError";
  }
}

export async function createDrop(
  input: CreateDropInput,
): Promise<CreateDropResponse> {
  return bffFetch<CreateDropResponse>("/api/drops", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function presignDropFile(
  dropId: string,
  file: File,
): Promise<PresignFileResponse> {
  return bffFetch<PresignFileResponse>(`/api/drops/${dropId}/files/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      original_name: file.name,
      content_type: file.type || "application/octet-stream",
      size_bytes: file.size,
    }),
  });
}

export async function uploadToStorage(
  file: File,
  presigned: PresignFileResponse,
): Promise<void> {
  const formData = new FormData();
  for (const [key, value] of Object.entries(presigned.fields))
    formData.append(key, value);
  formData.append("file", file);
  const response = await fetch(presigned.upload_url, {
    method: "POST",
    body: formData,
  });
  if (!response.ok)
    throw new Error("The selected file could not be uploaded to storage.");
}

export async function completeDropFile(
  dropId: string,
  fileId: string,
): Promise<DropFile> {
  return bffFetch<DropFile>(`/api/drops/${dropId}/files/${fileId}/complete`, {
    method: "POST",
  });
}

export async function uploadDropFile(
  dropId: string,
  file: File,
): Promise<DropFile> {
  const presigned = await presignDropFile(dropId, file);
  await uploadToStorage(file, presigned);
  return completeDropFile(dropId, presigned.file_id);
}

export function validateDropFiles(files: File[]) {
  if (files.length > MAX_FILES_PER_DROP)
    throw new Error("You can attach up to 5 files.");
  for (const file of files) {
    if (file.size === 0) throw new Error(`${file.name} is empty.`);
    if (file.size > MAX_FILE_SIZE)
      throw new Error(`${file.name} exceeds the 10 MiB file limit.`);
    if (file.name.length > 255)
      throw new Error(`${file.name} has a file name that is too long.`);
  }
  const totalSize = files.reduce((total, file) => total + file.size, 0);
  if (totalSize > MAX_DROP_FILE_SIZE)
    throw new Error("Attachments cannot exceed 20 MiB in total.");
}

export type CreateDropWithFilesInput = {
  drop: CreateDropInput;
  files: File[];
  onProgress?: (progress: UploadProgress) => void;
};

export async function createDropWithFiles({
  drop: dropInput,
  files,
  onProgress,
}: CreateDropWithFilesInput): Promise<CreateDropResponse> {
  validateDropFiles(files);
  onProgress?.({ stage: "creating", totalFiles: files.length });
  const drop = await createDrop(dropInput);

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    onProgress?.({
      stage: "uploading",
      file,
      fileIndex: index,
      completedFiles: index,
      totalFiles: files.length,
    });
    try {
      await uploadDropFile(drop.id, file);
    } catch (cause) {
      throw new DropUploadError(
        `The Drop was created, but ${file.name} could not be uploaded.`,
        drop,
        index,
        file,
        { cause },
      );
    }
  }

  onProgress?.({
    stage: "complete",
    completedFiles: files.length,
    totalFiles: files.length,
  });
  return drop;
}

export async function getDrops(
  params: GetDropsParams = {},
): Promise<PaginatedDrops> {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.page_size !== undefined)
    searchParams.set("page_size", String(params.page_size));
  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  const query = searchParams.toString();
  return bffFetch<PaginatedDrops>(`/api/drops${query ? `?${query}` : ""}`);
}

export async function getDrop(dropId: string): Promise<Drop> {
  return bffFetch<Drop>(`/api/drops/${dropId}`);
}

export async function getDropFiles(dropId: string): Promise<DropFile[]> {
  return bffFetch<DropFile[]>(`/api/drops/${dropId}/files`);
}

export async function getDropShareToken(dropId: string): Promise<string> {
  const response = await bffFetch<{ share_token: string }>(
    `/api/drops/${dropId}/share-token`,
  );
  return response.share_token;
}

export async function updateDrop(
  dropId: string,
  input: UpdateDropInput,
): Promise<Drop> {
  return bffFetch<Drop>(`/api/drops/${dropId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function revokeDrop(dropId: string): Promise<void> {
  return bffFetch<void>(`/api/drops/${dropId}/revoke`, { method: "POST" });
}
