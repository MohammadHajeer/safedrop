import { proxyAuthenticatedRequest } from "@/lib/server/route-handler";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyAuthenticatedRequest(request, `/drops/${encodeURIComponent(id)}/share-token`);
}
