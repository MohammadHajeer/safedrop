import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowDownToLineIcon,
  ArrowRightIcon,
  CalendarClockIcon,
  FileIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { PublicShell } from "@/components/public/public-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button-link";
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
      <main className="relative flex flex-1 items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,var(--primary-soft),transparent_68%)] opacity-70" />
        <section className="relative mx-auto grid w-full max-w-4xl items-center gap-8 rounded-3xl border bg-card p-6 shadow-[0_18px_50px_-36px_rgba(14,21,20,0.45)] sm:p-10 md:grid-cols-[0.8fr_1.2fr]">
          <Image
            src="/illustrations/protected-private.webp"
            alt="A private SafeDrop that is no longer accessible"
            width={440}
            height={293}
            loading="eager"
            className="mx-auto h-auto w-full max-w-sm"
          />
          <div>
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1.5 text-primary"
            >
              Private by design
            </Badge>
            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              {serviceError
                ? "This Drop cannot be opened right now"
                : "This Drop is no longer available"}
            </h1>
            <p className="mt-4 leading-7 text-muted-foreground">
              {serviceError
                ? "SafeDrop could not securely retrieve this Drop. Wait a moment, then ask the sender to confirm the link if the problem continues."
                : "It may have expired, reached its view limit, been revoked by the sender, or the link may be incomplete."}
            </p>
            <Alert className="mt-6 border-primary/15 bg-primary-soft/35">
              <ShieldCheckIcon />
              <AlertTitle>No private details were revealed</AlertTitle>
              <AlertDescription>
                SafeDrop uses the same unavailable response for private and
                invalid links.
              </AlertDescription>
            </Alert>
            <ButtonLink href="/create" className="mt-7 h-11 rounded-full px-5">
              Create your own Drop
              <ArrowRightIcon data-icon="inline-end" />
            </ButtonLink>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}

function ReceivedDrop({ drop }: { drop: SharedDrop }) {
  return (
    <PublicShell>
      <main className="relative flex-1 overflow-hidden px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,var(--primary-soft),transparent_68%)] opacity-70" />
        <div className="relative mx-auto grid w-full max-w-6xl items-start gap-10 lg:grid-cols-[0.68fr_1fr] lg:gap-14">
          <aside className="lg:sticky lg:top-28">
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1.5 text-primary"
            >
              <ShieldCheckIcon /> Opened securely
            </Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-5xl">
              A Drop has arrived.
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-8 text-muted-foreground">
              The sender chose to share this temporarily. Save anything you need
              before the Drop expires.
            </p>
            <div className="mt-7 flex items-start gap-3 rounded-xl border bg-card/70 p-4 text-sm">
              <CalendarClockIcon className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Available until</p>
                <time
                  dateTime={drop.expires_at}
                  className="mt-1 block text-muted-foreground"
                >
                  {formatExpiration(drop.expires_at)}
                </time>
              </div>
            </div>
            <div className="mt-7 hidden rounded-3xl border bg-primary-soft/35 p-5 lg:block">
              <Image
                src="/illustrations/received-drop.webp"
                alt="A document safely received through SafeDrop"
                width={520}
                height={347}
                className="h-auto w-full"
              />
            </div>
          </aside>

          <article className="rounded-2xl border bg-card p-5 shadow-[0_18px_50px_-36px_rgba(14,21,20,0.45)] sm:p-8">
            <header>
              <p className="text-sm font-medium text-primary">
                Shared with you
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-pretty sm:text-3xl">
                {drop.title}
              </h2>
            </header>

            <Separator className="my-7" />

            <section aria-labelledby="message-heading">
              <h3
                id="message-heading"
                className="text-sm font-semibold tracking-wide text-muted-foreground uppercase"
              >
                Message
              </h3>
              <div className="mt-3 overflow-hidden rounded-xl border bg-muted/25 p-4 sm:p-5">
                <p className="wrap-break-word whitespace-pre-wrap leading-7">
                  {drop.content}
                </p>
              </div>
            </section>

            {drop.files.length > 0 ? (
              <section aria-labelledby="attachments-heading" className="mt-8">
                <div className="flex items-center justify-between gap-4">
                  <h3
                    id="attachments-heading"
                    className="text-sm font-semibold tracking-wide text-muted-foreground uppercase"
                  >
                    {drop.files.length === 1 ? "Attachment" : "Attachments"}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Temporary download link
                  </span>
                </div>
                <div className="mt-3 space-y-3">
                  {drop.files.map((file) => (
                    <Card
                      key={file.id}
                      size="sm"
                      className="gap-0 py-0 shadow-none ring-border"
                    >
                      <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
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
              <p className="mt-7 text-sm text-muted-foreground">
                This Drop does not include an attachment.
              </p>
            )}

            <Alert className="mt-8 border-primary/15 bg-primary-soft/35">
              <ShieldCheckIcon />
              <AlertTitle>Keep what you need</AlertTitle>
              <AlertDescription>
                This page visit has used one of the sender&apos;s allowed views.
                Avoid refreshing unless necessary.
              </AlertDescription>
            </Alert>
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
