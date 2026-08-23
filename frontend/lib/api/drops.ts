import { bffFetch } from "./bff";

const MIB = 1024 * 1024;

const MAX_FILES_PER_DROP = 5;
const MAX_FILE_SIZE = 10 * MIB;
const MAX_DROP_FILE_SIZE = 20 * MIB;

export type CreateDropInput = {
  title: string;
  content: string;
  expires_at: string;
  max_views: number;
};

export type DropStatus = "active" | "expired" | "consumed" | "revoked";

export type Drop = {
  id: string;
  owner_id: string;
  title: string;
  content: string;
  expires_at: string;
  max_views: number;
  view_count: number;
  status: DropStatus;
};

export type CreateDropResponse = Drop & {
  share_token: string;
};

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
};

export async function createDrop(
  input: CreateDropInput,
): Promise<CreateDropResponse> {
  return bffFetch<CreateDropResponse>("/api/drops", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function presignDropFile(
  dropId: string,
  file: File,
): Promise<PresignFileResponse> {
  return bffFetch<PresignFileResponse>(`/api/drops/${dropId}/files/presign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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

  for (const [key, value] of Object.entries(presigned.fields)) {
    formData.append(key, value);
  }

  formData.append("file", file);

  const response = await fetch(presigned.upload_url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("File upload failed");
  }
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
  if (files.length > MAX_FILES_PER_DROP) {
    throw new Error("You can attach up to 5 files");
  }

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`${file.name} exceeds the 10 MB file limit`);
    }
  }

  const totalSize = files.reduce((total, file) => total + file.size, 0);

  if (totalSize > MAX_DROP_FILE_SIZE) {
    throw new Error("Attachments cannot exceed 20 MB in total");
  }
}

export type CreateDropWithFilesInput = {
  drop: CreateDropInput;
  files: File[];
};

export async function createDropWithFiles({
  drop: dropInput,
  files,
}: CreateDropWithFilesInput): Promise<CreateDropResponse> {
  validateDropFiles(files);

  // 1. The Drop must exist first because uploads need its ID.
  const drop = await createDrop(dropInput);

  // 2. Upload every selected attachment.
  for (const file of files) {
    await uploadDropFile(drop.id, file);
  }

  // 3. Only return success after every attachment is finalized.
  return drop;
}

export async function getDrops(
  params: GetDropsParams = {},
): Promise<PaginatedDrops> {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.page_size !== undefined) {
    searchParams.set("page_size", String(params.page_size));
  }

  const query = searchParams.toString();

  return bffFetch<PaginatedDrops>(
    `/api/drops${query ? `?${query}` : ""}`,
  );
}

export async function getDrop(dropId: string): Promise<Drop> {
  return bffFetch<Drop>(`/api/drops/${dropId}`);
}

export async function updateDrop(
  dropId: string,
  input: UpdateDropInput,
): Promise<Drop> {
  return bffFetch<Drop>(`/api/drops/${dropId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function revokeDrop(dropId: string): Promise<Drop> {
  return bffFetch<Drop>(`/api/drops/${dropId}/revoke`, {
    method: "POST",
  });
}
