export const ACCESS_TOKEN_COOKIE = "safedrop_access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

export const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

type JwtClaims = {
  exp?: unknown;
  type?: unknown;
};

function readJwtClaims(token: string): JwtClaims | undefined {
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
    return JSON.parse(atob(padded)) as JwtClaims;
  } catch {
    return undefined;
  }
}

export function readJwtExpiration(token: string): Date | undefined {
  const expiration = readJwtClaims(token)?.exp;

  return typeof expiration === "number"
    ? new Date(expiration * 1000)
    : undefined;
}

export function readJwtUserType(token: string): "admin" | "client" | undefined {
  const userType = readJwtClaims(token)?.type;

  return userType === "admin" || userType === "client" ? userType : undefined;
}

export function accessTokenNeedsRefresh(token: string): boolean {
  const expiresAt = readJwtExpiration(token);

  return !expiresAt || expiresAt.getTime() <= Date.now() + 15_000;
}
