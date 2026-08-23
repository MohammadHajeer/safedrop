import { ApiError } from "./errors";

export async function bffFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, options);

  if (!response.ok) {
    let data: unknown = null;

    try {
      data = await response.json();
    } catch {
      // The response may not contain JSON.
    }

    throw new ApiError(response.status, data);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
