import { NextResponse } from "next/server";

import { nextResponseFromBackend } from "@/lib/server/route-handler";
import {
  applySessionUpdate,
  authenticatedBackendRequest,
  clearAuthCookies,
} from "@/lib/server/session";

export async function GET() {
  try {
    const result = await authenticatedBackendRequest("/users/me");
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
