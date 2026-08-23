import { proxyAuthenticatedRequest } from "@/lib/server/route-handler";

export async function POST(
  request: Request,
  {
    params,
  }: { params: Promise<{ id: string; fileId: string }> },
) {
  const { id, fileId } = await params;
  return proxyAuthenticatedRequest(
    request,
    `/drops/${encodeURIComponent(id)}/files/${encodeURIComponent(fileId)}/complete`,
  );
}
