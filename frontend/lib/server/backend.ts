import "server-only";

function getFastApiUrl(): string {
  const url = process.env.FASTAPI_URL;

  if (!url) {
    throw new Error("FASTAPI_URL is not defined");
  }

  return url.replace(/\/$/, "");
}

export function backendFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  return fetch(`${getFastApiUrl()}${path}`, {
    ...options,
    cache: "no-store",
  });
}

export function withBearerToken(
  token: string,
  options: RequestInit = {},
): RequestInit {
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  return { ...options, headers };
}

export function getBackendSetCookies(response: Response): string[] {
  const headers = response.headers as Headers & {
    getSetCookie?: () => string[];
  };

  return headers.getSetCookie?.() ??
    (headers.get("set-cookie") ? [headers.get("set-cookie") as string] : []);
}
