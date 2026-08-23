export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
  ) {
    super(`API request failed with status ${status}`);
  }
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.data && typeof error.data === "object") {
    const detail = "detail" in error.data ? error.data.detail : undefined;

    if (typeof detail === "string") {
      return detail;
    }
  }

  return error instanceof Error ? error.message : "Something went wrong";
}
