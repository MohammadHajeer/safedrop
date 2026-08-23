import { apiFetch } from "./client";

export type SharedDropFile = {
  id: string;
  original_name: string;
  content_type: string;
  size_bytes: number;
  download_url: string;
};

export type SharedDrop = {
  title: string;
  content: string;
  expires_at: string;
  files: SharedDropFile[];
};

export async function getSharedDrop(shareToken: string): Promise<SharedDrop> {
  // This endpoint consumes exactly one Drop view. Keep this as one deliberate,
  // uncached request and do not add automatic retries or client refetching.
  return apiFetch<SharedDrop>(`/d/${encodeURIComponent(shareToken)}`, {
    cache: "no-store",
  });
}
