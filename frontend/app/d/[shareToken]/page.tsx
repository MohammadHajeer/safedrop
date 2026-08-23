import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowDownToLineIcon,
  ArrowRightIcon,
  CalendarClockIcon,
  FileIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { AuthAwareButtonLink } from "@/components/public/auth-aware-public";
import { PublicShell } from "@/components/public/public-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonAnchor } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ApiError } from "@/lib/api/errors";
import { getSharedDrop, type SharedDrop } from "@/lib/api/share";

export const metadata: Metadata = {
  title: "Received Drop",
  description: "Open a temporary Drop shared with you.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}

function formatExpiration(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Expiration set by the sender";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function UnavailableDrop({ serviceError = false }: { serviceError?: boolean }) {
  return (
    <PublicShell>
      <main className="relative flex flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-20 bg-background" />

        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-44 left-[-10rem] size-[34rem] rounded-full bg-primary/8 blur-[110px]" />
          <div className="absolute right-[-12rem] bottom-[-16rem] size-[38rem] rounded-full bg-primary-soft blur-[110px]" />
        </div>

        <div className="mx-auto grid w-full max-w-[80rem] items-center gap-12 px-4 py-14 sm:px-6 sm:py-18 lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-10 lg:py-20">
          <div className="relative">
            <div className="absolute inset-[15%] rounded-full bg-primary/10 blur-3xl" />

            <Image
              src="/illustrations/protected-private.webp"
              alt="A SafeDrop that is no longer accessible"
              width={720}
              height={480}
              priority
              className="relative mx-auto h-auto w-full max-w-xl drop-shadow-[0_28px_38px_rgba(15,75,66,0.12)]"
            />
          </div>

          <section className="max-w-xl">
            <Badge
              variant="secondary"
              className="rounded-full border-primary/15 bg-primary-soft/75 px-3.5 py-1.5 text-primary"
            >
              <ShieldCheckIcon />
              Private by design
            </Badge>

            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-balance sm:text-5xl">
              {serviceError
                ? "This Drop can't be opened right now."
                : "This Drop is no longer available."}
            </h1>

            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              {serviceError
                ? "SafeDrop could not securely retrieve this Drop. Try again later or ask the sender to confirm the link."
                : "It may have expired, reached its view limit, been revoked by the sender, or the link may be incomplete."}
            </p>

            <Alert className="mt-7 border-primary/15 bg-primary-soft/35">
              <ShieldCheckIcon />
              <AlertTitle>No private details were revealed</AlertTitle>
              <AlertDescription>
                SafeDrop intentionally gives invalid and unavailable links the
                same response.
              </AlertDescription>
            </Alert>

            <AuthAwareButtonLink
              guestHref="/create"
              authenticatedHref="/dashboard/drops/new"
              size="lg"
              className="mt-8 h-12 rounded-full px-6"
            >
              Create your own Drop
              <ArrowRightIcon data-icon="inline-end" />
            </AuthAwareButtonLink>
          </section>
        </div>
      </main>
    </PublicShell>
  );
}

function ReceivedDrop({ drop }: { drop: SharedDrop }) {
  return (
    <PublicShell>
      <main className="relative flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-20 bg-background" />

        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-44 left-[-10rem] size-[34rem] rounded-full bg-primary/8 blur-[110px]" />
          <div className="absolute right-[-12rem] bottom-[-16rem] size-[38rem] rounded-full bg-primary-soft blur-[110px]" />

          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:80px_80px] opacity-[0.08] mask-[linear-gradient(to_bottom,black,transparent_90%)]" />
        </div>

        <div className="mx-auto grid w-full max-w-[88rem] items-start gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20 lg:px-10 lg:py-20">
          {/* STORY */}
          <aside className="lg:sticky lg:top-28">
            <Badge
              variant="secondary"
              className="rounded-full border-primary/15 bg-primary-soft/75 px-3.5 py-1.5 text-primary"
            >
              <ShieldCheckIcon />
              Opened securely
            </Badge>

            <h1 className="mt-6 max-w-xl text-4xl leading-[0.98] font-semibold tracking-[-0.055em] text-balance sm:text-5xl lg:text-6xl">
              A Drop
              <span className="block text-primary">has arrived.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
              The sender chose to share this temporarily. Keep anything you need
              before the Drop reaches its limit.
            </p>

            <div className="mt-8 flex max-w-md items-start gap-4 rounded-2xl border bg-background/65 p-4 backdrop-blur-sm">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <CalendarClockIcon className="size-4.5" />
              </span>

              <div>
                <p className="text-sm font-semibold">Available until</p>

                <time
                  dateTime={drop.expires_at}
                  className="mt-1 block text-sm text-muted-foreground"
                >
                  {formatExpiration(drop.expires_at)}
                </time>
              </div>
            </div>

            <div className="relative mt-10 hidden lg:block">
              <div className="absolute inset-x-[10%] bottom-[5%] h-[50%] rounded-full bg-primary/10 blur-3xl" />

              <Image
                src="/illustrations/received-drop.webp"
                alt="A document safely received through SafeDrop"
                width={720}
                height={480}
                className="relative h-auto w-full max-w-xl drop-shadow-[0_28px_38px_rgba(15,75,66,0.13)]"
              />
            </div>
          </aside>

          {/* DROP CONTENT */}
          <article className="relative">
            <div className="absolute inset-x-[8%] bottom-[-4%] -z-10 h-[60%] rounded-full bg-primary/7 blur-3xl" />

            <div className="rounded-[2rem] border bg-card/96 p-6 shadow-[0_30px_90px_-55px_rgba(14,45,40,0.55)] backdrop-blur-sm sm:p-9">
              <header>
                <p className="text-sm font-semibold tracking-wide text-primary uppercase">
                  Shared with you
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-pretty sm:text-4xl">
                  {drop.title}
                </h2>
              </header>

              <Separator className="my-8" />

              <section aria-labelledby="message-heading">
                <h3
                  id="message-heading"
                  className="text-sm font-semibold tracking-wide text-muted-foreground uppercase"
                >
                  Message
                </h3>

                <div className="mt-4 rounded-2xl border bg-muted/20 p-5 sm:p-6">
                  <p className="wrap-break-word whitespace-pre-wrap leading-7">
                    {drop.content}
                  </p>
                </div>
              </section>

              {drop.files.length > 0 ? (
                <section aria-labelledby="attachments-heading" className="mt-9">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h3
                        id="attachments-heading"
                        className="text-sm font-semibold tracking-wide text-muted-foreground uppercase"
                      >
                        {drop.files.length === 1 ? "Attachment" : "Attachments"}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Download anything you need before this Drop becomes
                        unavailable.
                      </p>
                    </div>

                    <span className="hidden text-xs text-muted-foreground sm:block">
                      Temporary links
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {drop.files.map((file) => (
                      <Card
                        key={file.id}
                        size="sm"
                        className="gap-0 overflow-hidden py-0 shadow-none ring-border transition-colors hover:border-primary/25"
                      >
                        <CardContent className="flex items-center gap-4 p-4">
                          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                            <FileIcon className="size-5" />
                          </span>

                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate font-medium"
                              title={file.original_name}
                            >
                              {file.original_name}
                            </p>

                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {file.content_type || "File"} ·{" "}
                              {formatBytes(file.size_bytes)}
                            </p>
                          </div>

                          <ButtonAnchor
                            variant="outline"
                            className="h-10 shrink-0 rounded-full px-4"
                            href={file.download_url}
                          >
                            <ArrowDownToLineIcon />
                            <span className="hidden sm:inline">Download</span>
                          </ButtonAnchor>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              ) : (
                <div className="mt-8 rounded-xl border border-dashed px-4 py-4 text-sm text-muted-foreground">
                  This Drop contains a message only—there are no attachments.
                </div>
              )}

              <Alert className="mt-9 border-primary/15 bg-primary-soft/35">
                <ShieldCheckIcon />
                <AlertTitle>Keep what you need</AlertTitle>
                <AlertDescription>
                  Opening this page has used one of the sender&apos;s allowed
                  views. Avoid refreshing unless you need to.
                </AlertDescription>
              </Alert>
            </div>
          </article>
        </div>
      </main>
    </PublicShell>
  );
}

export default async function SharedDropPage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;
  let drop: SharedDrop | undefined;
  let serviceError = false;

  try {
    drop = await getSharedDrop(shareToken);
  } catch (caught) {
    serviceError = caught instanceof ApiError && caught.status >= 500;
  }

  if (!drop) return <UnavailableDrop serviceError={serviceError} />;

  return <ReceivedDrop drop={drop} />;
}
