import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DropDetails } from "@/components/drops/drop-details";
import { getServerDrop, getServerDropFiles } from "@/lib/server/data";

export const metadata: Metadata = { title: "Drop details" };

async function loadDrop(id: string) {
  try {
    return await Promise.all([getServerDrop(id), getServerDropFiles(id)]);
  } catch (caught) {
    if (caught instanceof Error && caught.message.includes("404")) notFound();
    throw caught;
  }
}

export default async function DropPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [drop, files] = await loadDrop(id);
  return <DropDetails initialDrop={drop} files={files} />;
}
