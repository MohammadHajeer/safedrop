import Image from "next/image";

import { Badge } from "@/components/ui/badge";

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
}: AuthLayoutProps) {
  return (
    <main className="relative flex flex-1 items-center overflow-hidden px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,var(--primary-soft),transparent_68%)] opacity-70" />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.8fr)] lg:gap-16">
        <section className="order-2 hidden lg:order-1 lg:block">
          <Badge
            variant="secondary"
            className="mb-6 rounded-full px-3 py-1 text-primary"
          >
            {eyebrow}
          </Badge>
          <h2 className="max-w-xl text-4xl leading-[1.1] font-semibold tracking-[-0.035em] text-balance xl:text-5xl">
            Share what matters. Keep control of how long it stays.
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-8 text-muted-foreground">
            SafeDrop keeps temporary text and file sharing simple, with expiring
            links and clear view limits.
          </p>
          <div className="mt-8 flex justify-center rounded-3xl border bg-primary-soft/45 p-5">
            <Image
              src="/illustrations/protected-private.webp"
              alt="Documents protected inside the SafeDrop mark"
              width={640}
              height={426}
              loading="eager"
              className="h-auto w-full max-w-md drop-shadow-sm"
            />
          </div>
        </section>

        <section className="order-1 mx-auto w-full max-w-md lg:order-2">
          <div className="rounded-2xl border bg-card p-5 shadow-[0_18px_50px_-36px_rgba(14,21,20,0.45)] sm:p-8">
            <Badge
              variant="secondary"
              className="mb-5 rounded-full px-3 py-1 text-primary lg:hidden"
            >
              {eyebrow}
            </Badge>
            <h1 className="text-3xl font-semibold tracking-[-0.03em]">
              {title}
            </h1>
            <p className="mt-2 leading-7 text-muted-foreground">
              {description}
            </p>
            <div className="mt-7">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
