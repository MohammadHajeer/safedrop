import type { Metadata } from "next";

import { DropDetails } from "@/components/drops/drop-details";

export const metadata: Metadata = { title: "Drop details" };

export default async function DropPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DropDetails dropId={id} />;
}
