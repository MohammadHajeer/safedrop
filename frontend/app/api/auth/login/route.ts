import { NextResponse } from "next/server";

import type { BackendAuthResponse, LoginInput } from "@/lib/auth-types";
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

  let input: LoginInput;

  try {
    input = (await request.json()) as LoginInput;
  } catch {
    return NextResponse.json(
      { detail: "Invalid login request" },
      { status: 400 },
    );
  }

  try {
    const form = new URLSearchParams({
      username: input.email,
      password: input.password,
    });
    const backendResponse = await backendFetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });

    if (!backendResponse.ok) {
      return nextResponseFromBackend(backendResponse);
    }

    const data = (await backendResponse.json()) as BackendAuthResponse;
    const response = NextResponse.json({ user: data.user });

    const refreshSetCookies = getBackendSetCookies(backendResponse);

    console.log("FastAPI Set-Cookie:", refreshSetCookies);

    applySessionUpdate(response, {
      accessToken: data.access_token,
      refreshSetCookies,
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
