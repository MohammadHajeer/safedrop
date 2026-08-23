export const ACCESS_TOKEN_COOKIE = "safedrop_access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

export const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function readJwtExpiration(token: string): Date | undefined {
  try {
    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      return undefined;
    }

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(atob(padded)) as { exp?: unknown };

    return typeof payload.exp === "number"
      ? new Date(payload.exp * 1000)
      : undefined;
  } catch {
    return undefined;
  }
}

export function accessTokenNeedsRefresh(token: string): boolean {
  const expiresAt = readJwtExpiration(token);

  return !expiresAt || expiresAt.getTime() <= Date.now() + 15_000;
}
