import Image from "next/image";
import { LoaderCircleIcon } from "lucide-react";

import { PublicShell } from "@/components/public/public-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSharedDrop() {
  return (
    <PublicShell>
      <main className="relative flex flex-1 items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,var(--primary-soft),transparent_68%)] opacity-70" />
        <section className="relative mx-auto grid w-full max-w-4xl items-center gap-8 rounded-3xl border bg-card p-6 sm:p-10 md:grid-cols-[0.8fr_1.2fr]">
          <Image
            src="/illustrations/waiting-in-progress.webp"
            alt="SafeDrop preparing a shared Drop"
            width={440}
            height={293}
            className="mx-auto h-auto w-full max-w-sm"
          />
          <div aria-live="polite">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <LoaderCircleIcon className="size-4 animate-spin" /> Opening securely
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.035em]">Retrieving your Drop…</h1>
            <p className="mt-3 leading-7 text-muted-foreground">
              SafeDrop is checking the link and its availability.
            </p>
            <div className="mt-7 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
