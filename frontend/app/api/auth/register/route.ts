import { NextResponse } from "next/server";

import type { BackendAuthResponse, RegisterInput } from "@/lib/auth-types";
import { backendFetch, getBackendSetCookies } from "@/lib/server/backend";
import {
  nextResponseFromBackend,
  rejectCrossOriginMutation,
} from "@/lib/server/route-handler";
import { applySessionUpdate } from "@/lib/server/session";

export async function POST(request: Request) {
  const rejected = rejectCrossOriginMutation(request);

  if (rejected) {
    return rejected;
  }

  let input: RegisterInput;

  try {
    input = (await request.json()) as RegisterInput;
  } catch {
    return NextResponse.json(
      { detail: "Invalid registration request" },
      { status: 400 },
    );
  }

  try {
    const backendResponse = await backendFetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!backendResponse.ok) {
      return nextResponseFromBackend(backendResponse);
    }

    const data = (await backendResponse.json()) as BackendAuthResponse;
    const response = NextResponse.json({ user: data.user }, { status: 201 });

    applySessionUpdate(response, {
      accessToken: data.access_token,
      refreshSetCookies: getBackendSetCookies(backendResponse),
      user: data.user,
    });

    return response;
  } catch {
    return NextResponse.json(
      { detail: "Authentication service is unavailable" },
      { status: 502 },
    );
  }
}
