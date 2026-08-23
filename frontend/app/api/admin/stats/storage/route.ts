import { proxyAuthenticatedRequest } from "@/lib/server/route-handler";

export function GET(request: Request) {
  return proxyAuthenticatedRequest(request, "/admin/stats/storage");
}
