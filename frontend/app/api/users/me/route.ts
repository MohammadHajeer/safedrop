import { proxyAuthenticatedRequest } from "@/lib/server/route-handler";

export function PUT(request: Request) {
  return proxyAuthenticatedRequest(request, "/users/me");
}
