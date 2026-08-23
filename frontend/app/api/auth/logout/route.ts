import { NextRequest, NextResponse } from "next/server";

import { REFRESH_TOKEN_COOKIE } from "@/lib/auth-cookies";
import { backendFetch, getBackendSetCookies } from "@/lib/server/backend";
import { rejectCrossOriginMutation } from "@/lib/server/route-handler";
import { clearAuthCookies } from "@/lib/server/session";

export async function POST(request: NextRequest) {
  const rejected = rejectCrossOriginMutation(request);

  if (rejected) {
    return rejected;
  }

  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  let status = 200;

  try {
    const backendResponse = await backendFetch("/logout", {
      method: "POST",
      headers: refreshToken
        ? { Cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}` }
        : undefined,
    });
    status = backendResponse.ok ? 200 : 502;

    const response = NextResponse.json(
      backendResponse.ok
        ? { message: "Logged out successfully" }
        : { detail: "Backend logout failed" },
      { status },
    );

    for (const setCookie of getBackendSetCookies(backendResponse)) {
      response.headers.append("set-cookie", setCookie);
    }

    clearAuthCookies(response);
    return response;
  } catch {
    const response = NextResponse.json(
      { detail: "Backend logout could not be confirmed" },
      { status: 502 },
    );
    clearAuthCookies(response);
    return response;
  }
}
