import { proxyAuthenticatedRequest } from "@/lib/server/route-handler";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  const { id } = await params;
  return proxyAuthenticatedRequest(request, `/drops/${encodeURIComponent(id)}`);
}

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  return proxyAuthenticatedRequest(request, `/drops/${encodeURIComponent(id)}`);
}
