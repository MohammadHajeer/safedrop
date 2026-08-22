const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

let accessToken: string | null = null;

let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
  ) {
    super(`API request failed with status ${status}`);
  }
}

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

type RefreshResponse = {
  access_token: string;
  token_type: string;
};

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const response = await fetch(`${API_URL}/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      accessToken = null;
      return null;
    }

    const data: RefreshResponse = await response.json();

    accessToken = data.access_token;

    return data.access_token;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { auth = false, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);

  if (auth && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  if (auth && response.status === 401) {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      headers.set("Authorization", `Bearer ${newAccessToken}`);

      response = await fetch(`${API_URL}${path}`, {
        ...fetchOptions,
        headers,
        credentials: "include",
      });
    }
  }

  if (!response.ok) {
    let data: unknown = null;

    try {
      data = await response.json();
    } catch {
      // Response may not contain JSON.
    }

    throw new ApiError(response.status, data);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
