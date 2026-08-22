import { apiFetch } from "./client";
import {
  uploadToStorage,
  type DropFile,
  type PresignFileResponse,
} from "./drops";

const MIB = 1024 * 1024;
const GUEST_MAX_FILE_SIZE = 5 * MIB;

export type CreateGuestDropInput = {
  title: string;
  content: string;
  expires_at: string;
  max_views: number;
};

export type CreateGuestDropResponse = {
  id: string;
  owner_id: null;
  title: string;
  content: string;
  expires_at: string;
  max_views: number;
  view_count: number;
  status: "active" | "expired" | "consumed" | "revoked";

  share_token: string;
  management_token: string;
};

export async function createGuestDrop(
  input: CreateGuestDropInput,
): Promise<CreateGuestDropResponse> {
  return apiFetch<CreateGuestDropResponse>("/guest/drops", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

async function presignGuestFile(
  dropId: string,
  managementToken: string,
  file: File,
): Promise<PresignFileResponse> {
  return apiFetch<PresignFileResponse>(`/guest/drops/${dropId}/files/presign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Guest-Management-Token": managementToken,
    },
    body: JSON.stringify({
      original_name: file.name,
      content_type: file.type || "application/octet-stream",
      size_bytes: file.size,
    }),
  });
}

async function completeGuestFile(
  dropId: string,
  fileId: string,
  managementToken: string,
): Promise<DropFile> {
  return apiFetch<DropFile>(`/guest/drops/${dropId}/files/${fileId}/complete`, {
    method: "POST",
    headers: {
      "X-Guest-Management-Token": managementToken,
    },
  });
}

async function uploadGuestFile(
  dropId: string,
  managementToken: string,
  file: File,
): Promise<DropFile> {
  const presigned = await presignGuestFile(dropId, managementToken, file);

  await uploadToStorage(file, presigned);

  return completeGuestFile(dropId, presigned.file_id, managementToken);
}

export async function createGuestDropWithFile({
  drop: dropInput,
  file,
}: {
  drop: CreateGuestDropInput;
  file?: File;
}): Promise<CreateGuestDropResponse> {
  if (file && file.size > GUEST_MAX_FILE_SIZE) {
    throw new Error("Guest attachments cannot exceed 5 MB");
  }

  const drop = await createGuestDrop(dropInput);

  if (file) {
    await uploadGuestFile(drop.id, drop.management_token, file);
  }

  return drop;
}
