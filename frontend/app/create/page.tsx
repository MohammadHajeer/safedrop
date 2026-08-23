import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  Clock3Icon,
  EyeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ZapIcon,
} from "lucide-react";

import { GuestDropForm } from "@/components/guest/guest-drop-form";
import { PublicShell } from "@/components/public/public-shell";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/server/auth";

export const metadata: Metadata = {
  title: "Create a guest Drop",
  description: "Create a temporary SafeDrop link without an account.",
};

const guestLimits = [
  {
    icon: Clock3Icon,
    title: "Short-lived",
    text: "Expires within 1 hour",
  },
  {
    icon: EyeIcon,
    title: "View controlled",
    text: "Up to 3 recipient views",
  },
  {
    icon: ShieldCheckIcon,
    title: "Lightweight",
    text: "One file up to 5 MiB",
  },
];

export default async function CreateGuestDropPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard/drops/new");
  }

  return (
    <PublicShell>
      <main className="relative flex-1 overflow-hidden">
        {/* Background atmosphere */}
        <div className="pointer-events-none absolute inset-0 -z-20 bg-background" />

        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-[-10rem] size-[34rem] rounded-full bg-primary/8 blur-[110px]" />
          <div className="absolute right-[-12rem] bottom-[-16rem] size-[38rem] rounded-full bg-primary-soft blur-[110px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:80px_80px] opacity-[0.11] mask-[linear-gradient(to_bottom,black,transparent_88%)]" />
        </div>

        <div className="mx-auto grid w-full max-w-[88rem] gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-20 lg:px-10 lg:py-20">
          {/* LEFT */}
          <aside className="relative">
            <Badge
              variant="secondary"
              className="rounded-full border-primary/15 bg-primary-soft/75 px-3.5 py-1.5 text-primary"
            >
              <ZapIcon />
              Guest Drop
            </Badge>

            <h1 className="mt-6 max-w-2xl text-4xl leading-[0.98] font-semibold tracking-[-0.055em] text-balance sm:text-5xl lg:text-6xl">
              Share something now.
              <span className="block text-primary">
                Let it disappear later.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Send text and an optional file through one temporary link. Your
              recipient does not need a SafeDrop account.
            </p>

            {/* Limits */}
            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {guestLimits.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex items-center gap-4 rounded-2xl border bg-background/65 p-4 backdrop-blur-sm"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <Icon className="size-4.5" />
                    </span>

                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Illustration */}
            <div className="relative mt-10 hidden lg:block">
              <div className="absolute inset-x-[10%] bottom-[7%] h-[48%] rounded-full bg-primary/10 blur-3xl" />

              <Image
                src="/illustrations/sending-drop.webp"
                alt="A file being sent through SafeDrop"
                width={760}
                height={520}
                priority
                className="relative h-auto w-full max-w-xl drop-shadow-[0_26px_36px_rgba(15,75,66,0.13)]"
              />

              <div className="absolute right-[2%] bottom-[14%] rounded-2xl border bg-background/88 px-4 py-3 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <SparklesIcon className="size-4" />
                  </span>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      No account needed
                    </p>
                    <p className="text-sm font-semibold">Ready in seconds</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* FORM */}
          <section className="relative">
            <div className="absolute inset-x-[8%] bottom-[-6%] -z-10 h-[60%] rounded-full bg-primary/8 blur-3xl" />

            <div className="rounded-[2rem] border bg-card/96 p-5 shadow-[0_30px_90px_-55px_rgba(14,45,40,0.55)] backdrop-blur-sm sm:p-8 lg:p-9">
              <div className="mb-8 border-b pb-7">
                <p className="text-sm font-semibold tracking-wide text-primary uppercase">
                  New guest Drop
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                  Create your temporary share
                </h2>

                <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                  Choose what to share and how long it should remain available.
                  SafeDrop will generate one link when everything is ready.
                </p>
              </div>

              <GuestDropForm />
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
              Guest Drops are intentionally limited. Create an account when you
              need longer expiration, multiple files, and Drop management.
            </p>
          </section>
        </div>
      </main>
    </PublicShell>
  );
}
