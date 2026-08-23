import Image from "next/image";
import { LoaderCircleIcon, ShieldCheckIcon } from "lucide-react";

import { PublicShell } from "@/components/public/public-shell";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSharedDrop() {
  return (
    <PublicShell>
      <main className="relative flex flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-20 bg-background" />

        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-[-8rem] size-[32rem] rounded-full bg-primary/8 blur-[110px]" />
          <div className="absolute right-[-10rem] bottom-[-14rem] size-[36rem] rounded-full bg-primary-soft blur-[110px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:80px_80px] opacity-[0.1] mask-[linear-gradient(to_bottom,black,transparent_90%)]" />
        </div>

        <div className="mx-auto grid w-full max-w-[80rem] items-center gap-12 px-4 py-14 sm:px-6 sm:py-18 lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-10 lg:py-20">
          {/* VISUAL */}
          <section className="relative hidden lg:block">
            <Badge
              variant="secondary"
              className="rounded-full border-primary/15 bg-primary-soft/75 px-3.5 py-1.5 text-primary"
            >
              <ShieldCheckIcon />
              Secure recipient access
            </Badge>

            <h1 className="mt-6 max-w-xl text-5xl leading-[0.98] font-semibold tracking-[-0.055em] text-balance">
              Your Drop is
              <span className="block text-primary">being checked.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
              SafeDrop is verifying the link, expiration window, and remaining
              views before revealing anything.
            </p>

            <div className="relative mt-10 max-w-xl">
              <div className="absolute inset-x-[10%] bottom-[5%] h-[50%] rounded-full bg-primary/10 blur-3xl" />

              <Image
                src="/illustrations/waiting-in-progress.webp"
                alt="SafeDrop checking a shared Drop"
                width={720}
                height={480}
                priority
                className="relative h-auto w-full drop-shadow-[0_28px_38px_rgba(15,75,66,0.13)]"
              />
            </div>
          </section>

          {/* LOADING PANEL */}
          <section className="mx-auto w-full max-w-xl">
            <div className="rounded-[2rem] border bg-card/96 p-6 shadow-[0_30px_90px_-55px_rgba(14,45,40,0.55)] backdrop-blur-sm sm:p-9">
              <div
                aria-live="polite"
                className="flex items-center gap-2 text-sm font-semibold text-primary"
              >
                <LoaderCircleIcon className="size-4 animate-spin" />
                Opening securely
              </div>

              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Retrieving your Drop…
              </h2>

              <p className="mt-3 max-w-lg leading-7 text-muted-foreground">
                SafeDrop is checking whether this temporary link is still
                available.
              </p>

              <div className="mt-8 space-y-4 rounded-2xl border bg-muted/20 p-5">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-4/5" />

                <div className="pt-3">
                  <Skeleton className="h-14 w-full rounded-xl" />
                </div>
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-muted-foreground lg:hidden">
              Checking expiration and availability…
            </p>
          </section>
        </div>
      </main>
    </PublicShell>
  );
}
