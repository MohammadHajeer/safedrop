import "server-only";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  authCookieOptions,
  readJwtExpiration,
} from "@/lib/auth-cookies";
import type { BackendAuthResponse } from "@/lib/auth-types";

import { backendFetch, getBackendSetCookies, withBearerToken } from "./backend";

export type SessionUpdate = {
  accessToken: string;
  refreshSetCookies: string[];
  user: BackendAuthResponse["user"];
};

export type AuthenticatedBackendResult = {
  response: Response;
  session?: SessionUpdate;
  sessionInvalid: boolean;
};

const refreshRequests = new Map<string, Promise<SessionUpdate | null>>();

async function performRefresh(
  refreshToken: string,
): Promise<SessionUpdate | null> {
  const response = await backendFetch("/refresh", {
    method: "POST",
    headers: {
      Cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as BackendAuthResponse;

  if (!data.access_token || !data.user) {
    return null;
  }

  return {
    accessToken: data.access_token,
    refreshSetCookies: getBackendSetCookies(response),
    user: data.user,
  };
}

export function refreshSession(
  refreshToken: string,
): Promise<SessionUpdate | null> {
  const activeRefresh = refreshRequests.get(refreshToken);

  if (activeRefresh) {
    return activeRefresh;
  }

  const refresh = performRefresh(refreshToken).finally(() => {
    refreshRequests.delete(refreshToken);
  });

  refreshRequests.set(refreshToken, refresh);
  return refresh;
}

function unauthorizedResponse(): Response {
  return Response.json({ detail: "Authentication required" }, { status: 401 });
}

export async function authenticatedBackendRequest(
  path: string,
  options: RequestInit = {},
): Promise<AuthenticatedBackendResult> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  let accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  let session: SessionUpdate | undefined;

  if (!accessToken && refreshToken) {
    session = (await refreshSession(refreshToken)) ?? undefined;
    accessToken = session?.accessToken;
  }

  if (!accessToken) {
    return {
      response: unauthorizedResponse(),
      sessionInvalid: true,
    };
  }

  let response = await backendFetch(
    path,
    withBearerToken(accessToken, options),
  );

  if (response.status === 401 && !session && refreshToken) {
    session = (await refreshSession(refreshToken)) ?? undefined;

    if (session) {
      response = await backendFetch(
        path,
        withBearerToken(session.accessToken, options),
      );
    }
  }

  return {
    response,
    session,
    sessionInvalid: response.status === 401 && !session,
  };
}

export function applySessionUpdate(
  response: NextResponse,
  session: SessionUpdate,
): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, session.accessToken, {
    ...authCookieOptions,
    expires: readJwtExpiration(session.accessToken),
  });

  for (const setCookie of session.refreshSetCookies) {
    response.headers.append("set-cookie", setCookie);
  }
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    ...authCookieOptions,
    maxAge: 0,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    ...authCookieOptions,
    maxAge: 0,
  });
}
