import type { Metadata } from "next";
import Image from "next/image";
import { Clock3Icon, EyeIcon, ShieldCheckIcon } from "lucide-react";

import { GuestDropForm } from "@/components/guest/guest-drop-form";
import { PublicShell } from "@/components/public/public-shell";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Create a guest Drop",
  description: "Create a temporary SafeDrop link without an account.",
};

const guestLimits = [
  { icon: Clock3Icon, text: "Expires within 1 hour" },
  { icon: EyeIcon, text: "Up to 3 recipient views" },
  { icon: ShieldCheckIcon, text: "One file up to 5 MiB" },
];

export default function CreateGuestDropPage() {
  return (
    <PublicShell>
      <main className="relative flex-1 overflow-hidden px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,var(--primary-soft),transparent_68%)] opacity-70" />
        <div className="relative mx-auto grid w-full max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(520px,1fr)] lg:gap-14">
          <aside className="lg:sticky lg:top-28">
            <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-primary">
              Guest Drop
            </Badge>
            <h1 className="mt-5 text-4xl leading-[1.05] font-semibold tracking-[-0.045em] text-balance sm:text-5xl">
              Share now. Let it expire naturally.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              Create a temporary link for text and an optional file. Your recipient
              can open it without an account.
            </p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {guestLimits.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.text} className="flex items-center gap-3 text-sm">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <Icon className="size-4" />
                    </span>
                    {item.text}
                  </li>
                );
              })}
            </ul>
            <div className="mt-8 hidden rounded-3xl border bg-primary-soft/35 p-5 lg:block">
              <Image
                src="/illustrations/sending-drop.webp"
                alt="A file being sent through SafeDrop"
                width={520}
                height={347}
                className="h-auto w-full"
              />
            </div>
          </aside>

          <section className="rounded-2xl border bg-card p-5 shadow-[0_18px_50px_-36px_rgba(14,21,20,0.45)] sm:p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-semibold tracking-[-0.025em]">Create your Drop</h2>
              <p className="mt-2 leading-7 text-muted-foreground">
                Set the access window, then SafeDrop will give you one link to share.
              </p>
            </div>
            <GuestDropForm />
          </section>
        </div>
      </main>
    </PublicShell>
  );
}
