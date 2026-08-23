import "server-only";

import { NextResponse } from "next/server";

import {
  applySessionUpdate,
  authenticatedBackendRequest,
  clearAuthCookies,
} from "./session";

function requestBody(request: Request): Promise<ArrayBuffer> | undefined {
  return request.method === "GET" || request.method === "HEAD"
    ? undefined
    : request.arrayBuffer();
}

export async function nextResponseFromBackend(
  backendResponse: Response,
): Promise<NextResponse> {
  const body =
    backendResponse.status === 204
      ? null
      : await backendResponse.arrayBuffer();
  const headers = new Headers();
  const contentType = backendResponse.headers.get("content-type");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  return new NextResponse(body, {
    status: backendResponse.status,
    headers,
  });
}

export function rejectCrossOriginMutation(
  request: Request,
): NextResponse | null {
  if (request.method === "GET" || request.method === "HEAD") {
    return null;
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  const origin = request.headers.get("origin");

  if (fetchSite === "cross-site") {
    return NextResponse.json({ detail: "Cross-origin request blocked" }, { status: 403 });
  }

  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ detail: "Cross-origin request blocked" }, { status: 403 });
  }

  return null;
}

export async function proxyAuthenticatedRequest(
  request: Request,
  backendPath: string,
  backendMethod = request.method,
): Promise<NextResponse> {
  const rejected = rejectCrossOriginMutation(request);

  if (rejected) {
    return rejected;
  }

  try {
    const headers = new Headers();
    const contentType = request.headers.get("content-type");

    if (contentType) {
      headers.set("content-type", contentType);
    }

    const body = requestBody(request);
    const result = await authenticatedBackendRequest(backendPath, {
      method: backendMethod,
      headers,
      body: body ? await body : undefined,
    });
    const response = await nextResponseFromBackend(result.response);

    if (result.session) {
      applySessionUpdate(response, result.session);
    } else if (result.sessionInvalid) {
      clearAuthCookies(response);
    }

    return response;
  } catch {
    return NextResponse.json(
      { detail: "Authentication service is unavailable" },
      { status: 502 },
    );
  }
}
