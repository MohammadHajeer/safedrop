import { proxyAuthenticatedRequest } from "@/lib/server/route-handler";

export function GET(request: Request) {
  return proxyAuthenticatedRequest(
    request,
    `/users${new URL(request.url).search}`,
  );
}

export function POST(request: Request) {
  return proxyAuthenticatedRequest(request, "/users");
}
