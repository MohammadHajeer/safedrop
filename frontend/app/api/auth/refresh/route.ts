import { NextRequest, NextResponse } from "next/server";

import { REFRESH_TOKEN_COOKIE } from "@/lib/auth-cookies";
import { rejectCrossOriginMutation } from "@/lib/server/route-handler";
import {
  applySessionUpdate,
  clearAuthCookies,
  refreshSession,
} from "@/lib/server/session";

function safeReturnTo(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";
}

async function refresh(request: NextRequest): Promise<NextResponse> {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    const response = NextResponse.json(
      { detail: "Authentication required" },
      { status: 401 },
    );
    clearAuthCookies(response);
    return response;
  }

  try {
    const session = await refreshSession(refreshToken);

    if (!session) {
      const response = NextResponse.json(
        { detail: "Invalid refresh token" },
        { status: 401 },
      );
      clearAuthCookies(response);
      return response;
    }

    const response = NextResponse.json({ user: session.user });
    applySessionUpdate(response, session);
    return response;
  } catch {
    return NextResponse.json(
      { detail: "Authentication service is unavailable" },
      { status: 502 },
    );
  }
}

export function POST(request: NextRequest) {
  const rejected = rejectCrossOriginMutation(request);

  if (rejected) {
    return rejected;
  }

  return refresh(request);
}

export async function GET(request: NextRequest) {
  const returnTo = safeReturnTo(request.nextUrl.searchParams.get("returnTo"));
  const refreshResponse = await refresh(request);

  if (refreshResponse.status >= 500) {
    return refreshResponse;
  }

  if (!refreshResponse.ok) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", returnTo);
    const response = NextResponse.redirect(loginUrl);
    clearAuthCookies(response);
    return response;
  }

  const response = NextResponse.redirect(new URL(returnTo, request.url));

  for (const setCookie of refreshResponse.headers.getSetCookie()) {
    response.headers.append("set-cookie", setCookie);
  }

  return response;
}
