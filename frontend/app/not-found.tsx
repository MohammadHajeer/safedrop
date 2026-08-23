import type { Metadata } from "next";
import Image from "next/image";
import { ArrowLeftIcon } from "lucide-react";

import { PublicShell } from "@/components/public/public-shell";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <PublicShell>
      <main className="relative flex flex-1 items-center overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,var(--primary-soft),transparent_68%)] opacity-70" />
        <div className="relative mx-auto grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <p className="text-sm font-semibold tracking-[0.14em] text-primary uppercase">
              404
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              Page not found
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-muted-foreground lg:mx-0">
              The page you&apos;re looking for may have moved, expired, or never
              existed.
            </p>
            <ButtonLink
              href="/"
              size="lg"
              className="mt-7 h-11 rounded-full px-5"
            >
              <ArrowLeftIcon /> Go home
            </ButtonLink>
          </div>
          <div className="order-1 mx-auto w-full max-w-xl rounded-3xl border bg-primary-soft/35 p-5 lg:order-2 sm:p-7">
            <Image
              src="/illustrations/not-found.webp"
              alt="A SafeDrop package looking for its missing destination"
              width={1448}
              height={1086}
              loading="eager"
              className="h-auto w-full drop-shadow-[0_20px_28px_rgba(17,60,54,0.1)]"
            />
          </div>
        </div>
      </main>
    </PublicShell>
  );
}
