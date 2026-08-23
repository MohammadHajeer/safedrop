import { proxyAuthenticatedRequest } from "@/lib/server/route-handler";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  return proxyAuthenticatedRequest(request, `/users/${userId}`);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  return proxyAuthenticatedRequest(request, `/users/${userId}`);
}
