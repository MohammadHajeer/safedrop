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

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => {
          if (!item || typeof item !== "object" || !("msg" in item)) return null;
          return typeof item.msg === "string" ? item.msg : null;
        })
        .filter((message): message is string => Boolean(message));

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }
  }

  return error instanceof Error ? error.message : "Something went wrong";
}
