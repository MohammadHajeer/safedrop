import { proxyAuthenticatedRequest } from "@/lib/server/route-handler";

export function GET(request: Request) {
  const query = new URL(request.url).search;
  return proxyAuthenticatedRequest(request, `/drops${query}`);
}

export function POST(request: Request) {
  return proxyAuthenticatedRequest(request, "/drops");
}
