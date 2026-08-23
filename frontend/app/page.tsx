import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRightIcon,
  CheckIcon,
  Clock3Icon,
  EyeIcon,
  FileUpIcon,
  Link2Icon,
  ShieldCheckIcon,
  SparklesIcon,
  UserRoundIcon,
  ZapIcon,
} from "lucide-react";

import { PublicShell } from "@/components/public/public-shell";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
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
    description: "Add a message, optionally attach a file, then choose when it expires.",
  },
  {
    icon: Link2Icon,
    number: "02",
    title: "Share",
    description: "Send one simple link. Recipients do not need a SafeDrop account.",
  },
  {
    icon: Clock3Icon,
    number: "03",
    title: "Let it disappear",
    description: "The Drop becomes unavailable after its time or view limit is reached.",
  },
];

const privacyPoints = [
  "Private object storage with short-lived download links",
  "An expiration time for every Drop",
  "A clear limit on recipient views",
];

export default function Home() {
  return (
    <PublicShell>
      <main className="flex-1 overflow-hidden">
        <section className="relative border-b">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_30%,var(--primary-soft),transparent_34%)] opacity-75" />
          <div className="relative mx-auto grid min-h-162.5 w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.04fr_0.96fr] lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <Badge
                variant="secondary"
                className="mb-6 rounded-full border-primary/15 px-3 py-1.5 text-primary"
              >
                <SparklesIcon />
                Share less permanently
              </Badge>
              <h1 className="text-5xl leading-[0.98] font-semibold tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl">
                Secure sharing that knows when to leave.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Send text and files through a temporary link with a view limit
                and expiration time you choose. No account required to start.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <ButtonLink
                  href="/create"
                  size="lg"
                  className="h-12 rounded-full px-6 text-base shadow-sm"
                >
                  Create a Drop
                  <ArrowRightIcon data-icon="inline-end" />
                </ButtonLink>
                <ButtonLink
                  href="/register"
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full px-6 text-base"
                >
                  Create an account
                </ButtonLink>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <ZapIcon className="size-4 text-primary" /> Guest mode in seconds
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheckIcon className="size-4 text-primary" /> No recipient account
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="absolute inset-x-[12%] bottom-[8%] h-[48%] rounded-full bg-primary/10 blur-3xl" />
              <Image
                src="/illustrations/sending-drop.webp"
                alt="A file being sent securely through SafeDrop"
                width={768}
                height={512}
                loading="eager"
                fetchPriority="high"
                className="relative h-auto w-full drop-shadow-[0_24px_30px_rgba(17,60,54,0.12)]"
              />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold tracking-wide text-primary uppercase">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                From private thought to temporary link.
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                SafeDrop keeps the workflow short and the controls understandable.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <Card key={step.title} className="relative gap-5 p-2 shadow-none ring-border">
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex items-center justify-between">
                        <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                          <Icon className="size-5" />
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">{step.number}</span>
                      </div>
                      <h3 className="mt-7 text-xl font-semibold tracking-[-0.02em]">{step.title}</h3>
                      <p className="mt-3 leading-7 text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section id="privacy" className="scroll-mt-24 border-y bg-card/50 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-20">
            <div className="mx-auto max-w-md rounded-3xl border bg-primary-soft/35 p-6 sm:p-8">
              <Image
                src="/illustrations/protected-private.webp"
                alt="Private documents protected by SafeDrop"
                width={640}
                height={426}
                className="h-auto w-full"
              />
            </div>
            <div>
              <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-primary">
                <ShieldCheckIcon /> Privacy by limitation
              </Badge>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                Sharing should not mean storing forever.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                SafeDrop gives every share a natural end. Files stay in private
                object storage, and recipients receive temporary download URLs
                only while the Drop is available.
              </p>
              <ul className="mt-7 space-y-4">
                {privacyPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <CheckIcon className="size-3.5" />
                    </span>
                    <span className="leading-6">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold tracking-wide text-primary uppercase">Choose your pace</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                Start as a guest. Sign up when you need more.
              </h2>
            </div>
            <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
              <Card className="gap-0 p-2 shadow-none ring-border">
                <CardContent className="p-6 sm:p-7">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-foreground">
                    <ZapIcon className="size-5" />
                  </span>
                  <h3 className="mt-6 text-2xl font-semibold tracking-tight">Guest</h3>
                  <p className="mt-2 leading-7 text-muted-foreground">
                    Best for one quick share. Create a Drop without signing in,
                    attach one file up to 5 MiB, and keep it live for up to an hour.
                  </p>
                  <ButtonLink href="/create" className="mt-7 h-11 rounded-full px-5">
                    Create as guest
                    <ArrowRightIcon data-icon="inline-end" />
                  </ButtonLink>
                </CardContent>
              </Card>
              <Card className="gap-0 border-primary/30 bg-primary-soft/25 p-2 shadow-none ring-primary/15">
                <CardContent className="p-6 sm:p-7">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <UserRoundIcon className="size-5" />
                  </span>
                  <h3 className="mt-6 text-2xl font-semibold tracking-tight">SafeDrop account</h3>
                  <p className="mt-2 leading-7 text-muted-foreground">
                    Made for repeat sharing, with longer expiration options,
                    larger file allowances, and a place to manage your Drops.
                  </p>
                  <ButtonLink
                    href="/register"
                    variant="outline"
                    className="mt-7 h-11 rounded-full border-primary/25 bg-card px-5"
                  >
                    Create an account
                    <ArrowRightIcon data-icon="inline-end" />
                  </ButtonLink>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 overflow-hidden rounded-3xl border bg-primary-soft px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:px-14 lg:py-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <EyeIcon className="size-4" /> You control the window
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                Ready to share something temporarily?
              </h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                Create your first guest Drop in under a minute.
              </p>
            </div>
            <ButtonLink
              href="/create"
              size="lg"
              className="h-12 shrink-0 rounded-full px-6 text-base"
            >
              Create a Drop
              <ArrowRightIcon data-icon="inline-end" />
            </ButtonLink>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
