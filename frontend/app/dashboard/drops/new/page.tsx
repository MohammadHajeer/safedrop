import type { Metadata } from "next";
import Image from "next/image";
import { LockKeyholeIcon, UploadCloudIcon } from "lucide-react";

import { AuthenticatedDropForm } from "@/components/drops/authenticated-drop-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Create Drop" };

export default function NewDropPage() {
  return (
    <div className="space-y-7">
      <header>
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">New share</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Create a Drop</h1>
        <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">Build a temporary message with the limits that make sense for this share.</p>
      </header>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="gap-0 p-1 shadow-none ring-border">
          <CardContent className="p-5 sm:p-7 lg:p-8"><AuthenticatedDropForm /></CardContent>
        </Card>
        <aside className="space-y-4 xl:sticky xl:top-10">
          <div className="overflow-hidden rounded-3xl border bg-primary-soft/35 p-5">
            <Image src="/illustrations/sending-drop.webp" alt="A file being sent securely through SafeDrop" width={480} height={320} className="h-auto w-full" />
          </div>
          <Card className="gap-4 p-5 shadow-none ring-border">
            <div className="flex gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary"><UploadCloudIcon className="size-4" /></span><div><h2 className="font-semibold">Direct uploads</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">File bytes travel from this browser to private object storage, never through the app server.</p></div></div>
            <div className="flex gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary"><LockKeyholeIcon className="size-4" /></span><div><h2 className="font-semibold">Temporary by design</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Every Drop ends when its time or view limit is reached.</p></div></div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
