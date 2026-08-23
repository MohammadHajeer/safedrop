import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRightIcon,
  CheckIcon,
  Clock3Icon,
  EyeIcon,
  FileUpIcon,
  Link2Icon,
  LockKeyholeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TimerResetIcon,
  UserRoundIcon,
  ZapIcon,
} from "lucide-react";

import { AuthAwareButtonLink } from "@/components/public/auth-aware-public";
import { PublicShell } from "@/components/public/public-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Secure, temporary sharing",
  description:
    "Share temporary text and files with expiring links and controlled view limits.",
};

const steps = [
  {
    icon: FileUpIcon,
    number: "01",
    title: "Create",
    description:
      "Write a message, attach your files, and decide how long the Drop should stay available.",
  },
  {
    icon: Link2Icon,
    number: "02",
    title: "Share",
    description:
      "Send one clean link. The recipient does not need a SafeDrop account.",
  },
  {
    icon: TimerResetIcon,
    number: "03",
    title: "Let it end",
    description:
      "The Drop becomes unavailable when its expiration time or view limit is reached.",
  },
];

const privacyPoints = [
  "Private object storage with short-lived download links",
  "An expiration time for every Drop",
  "A clear recipient view limit",
];

export default function Home() {
  return (
    <PublicShell>
      <main className="flex-1 overflow-hidden">
        {/* HERO */}
        <section className="relative isolate overflow-hidden border-b">
          <div className="pointer-events-none absolute inset-0 -z-20 bg-background" />

          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-40 right-[-10%] size-[42rem] rounded-full bg-primary/8 blur-[110px]" />
            <div className="absolute bottom-[-18rem] left-[-12rem] size-[34rem] rounded-full bg-primary-soft blur-[100px]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.16] mask-[linear-gradient(to_bottom,black,transparent_85%)]" />
          </div>

          <div className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-360 items-center gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.04fr_0.96fr] lg:px-10 lg:py-20 xl:gap-20">
            <div className="relative z-10 max-w-4xl">
              <Badge
                variant="secondary"
                className="mb-7 rounded-full border-primary/15 bg-primary-soft/80 px-3.5 py-1.5 text-primary"
              >
                <SparklesIcon />
                Share less permanently
              </Badge>

              <h1 className="max-w-4xl text-5xl leading-[0.94] font-semibold tracking-[-0.065em] text-balance sm:text-6xl md:text-7xl xl:text-[5.7rem]">
                Secure sharing,
                <span className="block text-primary">
                  without the forever part.
                </span>
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
                Send text and files through temporary links with expiration
                times and view limits you control. Start instantly as a guest,
                or sign in when you need more.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <AuthAwareButtonLink
                  guestHref="/create"
                  authenticatedHref="/dashboard/drops/new"
                  size="lg"
                  className="h-12 rounded-full px-7 text-base shadow-sm"
                >
                  Create a Drop
                  <ArrowRightIcon data-icon="inline-end" />
                </AuthAwareButtonLink>

                <AuthAwareButtonLink
                  guestHref="/register"
                  authenticatedHref="/dashboard"
                  authenticatedChildren="Dashboard"
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full bg-background/70 px-7 text-base backdrop-blur-sm"
                >
                  Create an account
                </AuthAwareButtonLink>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <ZapIcon className="size-4 text-primary" />
                  No account required
                </span>

                <span className="inline-flex items-center gap-2">
                  <Clock3Icon className="size-4 text-primary" />
                  Expiring by design
                </span>

                <span className="inline-flex items-center gap-2">
                  <EyeIcon className="size-4 text-primary" />
                  Controlled views
                </span>
              </div>
            </div>

            {/* HERO VISUAL */}
            <div className="relative mx-auto w-full max-w-2xl lg:max-w-none">
              <div className="absolute inset-x-[8%] bottom-[5%] h-[52%] rounded-full bg-primary/12 blur-3xl" />

              <div className="relative">
                <Image
                  src="/illustrations/sending-drop.webp"
                  alt="A file being sent securely through SafeDrop"
                  width={900}
                  height={700}
                  priority
                  className="relative z-10 h-auto w-full drop-shadow-[0_32px_48px_rgba(15,75,66,0.16)]"
                />

                <div className="absolute top-[9%] right-[1%] z-20 hidden rounded-2xl border bg-background/90 p-4 shadow-xl shadow-primary/5 backdrop-blur-md sm:block">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <EyeIcon className="size-4" />
                    </span>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Recipient views
                      </p>
                      <p className="text-sm font-semibold">Limited by you</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-[12%] left-[0%] z-20 hidden rounded-2xl border bg-background/90 p-4 shadow-xl shadow-primary/5 backdrop-blur-md sm:block">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <LockKeyholeIcon className="size-4" />
                    </span>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        File storage
                      </p>
                      <p className="text-sm font-semibold">
                        Private by default
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute right-[5%] bottom-[1%] z-20 hidden rounded-full border bg-background/90 px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur-md md:flex md:items-center md:gap-2">
                  <Clock3Icon className="size-4 text-primary" />
                  Expires automatically
                </div>
              </div>
            </div>
          </div>

          {/* VALUE STRIP */}
          <div className="border-t bg-background/65 backdrop-blur-md">
            <div className="mx-auto grid max-w-7xl divide-y px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8">
              <div className="flex items-center gap-4 py-5 md:px-7">
                <ShieldCheckIcon className="size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Temporary by design</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Every Drop has an ending.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 py-5 md:px-7">
                <EyeIcon className="size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Views under control</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Decide how many times it can be opened.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 py-5 md:px-7">
                <ZapIcon className="size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Guest-ready</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Share without creating an account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="scroll-mt-24 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
        >
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-sm font-semibold tracking-wide text-primary uppercase">
                How it works
              </p>

              <h2 className="mt-4 max-w-lg text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-5xl">
                Three steps.
                <span className="block text-muted-foreground">
                  Then it knows when to leave.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
                SafeDrop keeps temporary sharing understandable. No complicated
                permissions. No recipient account. No permanent link to clean up
                later.
              </p>
            </div>

            <div className="space-y-4">
              {steps.map((step) => {
                const Icon = step.icon;

                return (
                  <Card
                    key={step.title}
                    className="group overflow-hidden p-0 shadow-none ring-border transition-colors hover:border-primary/30"
                  >
                    <CardContent className="grid gap-6 p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-8">
                      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                        <Icon className="size-6" />
                      </span>

                      <div>
                        <h3 className="text-2xl font-semibold tracking-[-0.025em]">
                          {step.title}
                        </h3>
                        <p className="mt-2 max-w-xl leading-7 text-muted-foreground">
                          {step.description}
                        </p>
                      </div>

                      <span className="font-mono text-sm text-muted-foreground/70">
                        {step.number}
                      </span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* PRIVACY */}
        <section
          id="privacy"
          className="scroll-mt-24 border-y bg-card/45 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-24">
            <div className="relative">
              <div className="absolute inset-[12%] rounded-full bg-primary/10 blur-3xl" />

              <div className="relative overflow-hidden rounded-[2.25rem] border bg-primary-soft/30 p-5 sm:p-9">
                <Image
                  src="/illustrations/protected-private.webp"
                  alt="Private documents protected by SafeDrop"
                  width={760}
                  height={520}
                  className="h-auto w-full"
                />
              </div>
            </div>

            <div>
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1.5 text-primary"
              >
                <ShieldCheckIcon />
                Privacy by limitation
              </Badge>

              <h2 className="mt-6 max-w-xl text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-5xl">
                Sharing should not mean storing forever.
              </h2>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                SafeDrop gives every share a natural end. Files remain in
                private object storage, while recipients receive temporary
                download access only while the Drop itself is available.
              </p>

              <ul className="mt-8 space-y-4">
                {privacyPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <CheckIcon className="size-3.5" />
                    </span>
                    <span className="leading-7">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* GUEST VS ACCOUNT */}
        <section className="px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold tracking-wide text-primary uppercase">
                Choose your pace
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-5xl">
                Start instantly.
                <span className="block text-muted-foreground">
                  Sign up when you need more.
                </span>
              </h2>

              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Guest mode keeps one-off sharing fast. An account gives you more
                room and a place to manage everything.
              </p>
            </div>

            <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-2">
              <Card className="overflow-hidden p-2 shadow-none ring-border">
                <CardContent className="p-7 sm:p-9">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-foreground">
                    <ZapIcon className="size-5" />
                  </span>

                  <p className="mt-8 text-sm font-semibold text-muted-foreground">
                    QUICK SHARING
                  </p>

                  <h3 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">
                    Guest
                  </h3>

                  <p className="mt-4 leading-7 text-muted-foreground">
                    Best for one quick share. No account, one attachment, and a
                    short lifetime.
                  </p>

                  <div className="mt-7 space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckIcon className="size-4 text-primary" />
                      No registration
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="size-4 text-primary" />
                      One file up to 5 MiB
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="size-4 text-primary" />
                      Up to one hour
                    </div>
                  </div>

                  <AuthAwareButtonLink
                    guestHref="/create"
                    authenticatedHref="/dashboard/drops/new"
                    authenticatedChildren={
                      <>
                        Create a Drop
                        <ArrowRightIcon data-icon="inline-end" />
                      </>
                    }
                    className="mt-9 h-11 rounded-full px-5"
                  >
                    Create as guest
                    <ArrowRightIcon data-icon="inline-end" />
                  </AuthAwareButtonLink>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-primary/30 bg-primary-soft/25 p-2 shadow-none ring-primary/15">
                <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-primary/10 blur-3xl" />

                <CardContent className="relative p-7 sm:p-9">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                    <UserRoundIcon className="size-5" />
                  </span>

                  <p className="mt-8 text-sm font-semibold text-primary">
                    REPEAT SHARING
                  </p>

                  <h3 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">
                    SafeDrop account
                  </h3>

                  <p className="mt-4 leading-7 text-muted-foreground">
                    More room, longer expiration choices, multiple files, and a
                    dashboard for managing your Drops.
                  </p>

                  <div className="mt-7 space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckIcon className="size-4 text-primary" />
                      Up to five files per Drop
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="size-4 text-primary" />
                      Larger storage allowance
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="size-4 text-primary" />
                      Manage and revoke Drops
                    </div>
                  </div>

                  <AuthAwareButtonLink
                    guestHref="/register"
                    authenticatedHref="/dashboard"
                    authenticatedChildren={
                      <>
                        Dashboard
                        <ArrowRightIcon data-icon="inline-end" />
                      </>
                    }
                    className="mt-9 h-11 rounded-full px-5"
                  >
                    Create an account
                    <ArrowRightIcon data-icon="inline-end" />
                  </AuthAwareButtonLink>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-4 pb-24 sm:px-6 sm:pb-28 lg:px-8 lg:pb-32">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border bg-primary-soft px-6 py-14 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            <div className="pointer-events-none absolute -top-28 right-[-5rem] size-96 rounded-full bg-primary/12 blur-3xl" />

            <div className="relative flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <EyeIcon className="size-4" />
                  You control the window
                </div>

                <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
                  Share what matters.
                  <span className="block text-muted-foreground">
                    Keep control of how long it stays.
                  </span>
                </h2>

                <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                  Your first temporary Drop is only a few seconds away.
                </p>
              </div>

              <AuthAwareButtonLink
                guestHref="/create"
                authenticatedHref="/dashboard/drops/new"
                size="lg"
                className="h-12 shrink-0 rounded-full px-7 text-base"
              >
                Create a Drop
                <ArrowRightIcon data-icon="inline-end" />
              </AuthAwareButtonLink>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
