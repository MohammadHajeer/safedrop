import { NextRequest, NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessTokenNeedsRefresh,
  readJwtUserType,
} from "@/lib/auth-cookies";

function loginRedirect(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(loginUrl);
}

function isProtectedPath(pathname: string): boolean {
  return ["/dashboard", "/profile", "/admin"].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function guestOnlyDestination(pathname: string): string | undefined {
  if (pathname === "/create") {
    return "/dashboard/drops/new";
  }

  if (pathname === "/login" || pathname === "/register") {
    return "/dashboard";
  }

  return undefined;
}

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function proxy(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const protectedPath = isProtectedPath(request.nextUrl.pathname);

  if (accessToken && !accessTokenNeedsRefresh(accessToken)) {
    const guestDestination = guestOnlyDestination(request.nextUrl.pathname);

    if (guestDestination) {
      return NextResponse.redirect(new URL(guestDestination, request.url));
    }

    if (
      isAdminPath(request.nextUrl.pathname) &&
      readJwtUserType(accessToken) !== "admin"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (refreshToken) {
    const refreshUrl = new URL("/api/auth/refresh", request.url);
    refreshUrl.searchParams.set(
      "returnTo",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    if (!protectedPath) {
      refreshUrl.searchParams.set("optional", "1");
    }
    return NextResponse.redirect(refreshUrl);
  }

  const response = protectedPath ? loginRedirect(request) : NextResponse.next();

  if (accessToken) {
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
  }

  if (refreshToken) {
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
  }

  return response;
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/create",
    "/dashboard/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
