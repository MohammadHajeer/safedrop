import Image from "next/image";
import { Clock3Icon, EyeIcon, ShieldCheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

const trustPoints = [
  {
    icon: ShieldCheckIcon,
    text: "Private file storage",
  },
  {
    icon: Clock3Icon,
    text: "Expiration built in",
  },
  {
    icon: EyeIcon,
    text: "Controlled recipient views",
  },
];

export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
}: AuthLayoutProps) {
  return (
    <main className="relative flex flex-1 overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-20 bg-background" />

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-44 left-[-10rem] size-[34rem] rounded-full bg-primary/8 blur-[110px]" />
        <div className="absolute right-[-12rem] bottom-[-16rem] size-[38rem] rounded-full bg-primary-soft blur-[110px]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:80px_80px] opacity-[0.1] mask-[linear-gradient(to_bottom,black,transparent_90%)]" />
      </div>

      <div className="mx-auto grid w-full max-w-[88rem] items-center gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-[1.04fr_0.96fr] lg:gap-20 lg:px-10 lg:py-20">
        {/* BRAND / STORY SIDE */}
        <section className="relative hidden lg:block">
          <Badge
            variant="secondary"
            className="rounded-full border-primary/15 bg-primary-soft/75 px-3.5 py-1.5 text-primary"
          >
            <ShieldCheckIcon />
            {eyebrow}
          </Badge>

          <h2 className="mt-6 max-w-2xl text-5xl leading-[0.98] font-semibold tracking-[-0.055em] text-balance xl:text-6xl">
            Your temporary shares,
            <span className="block text-primary">always within reach.</span>
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Sign in when you want more room, longer sharing windows, and one
            calm place to manage every Drop you create.
          </p>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
            {trustPoints.map((point) => {
              const Icon = point.icon;

              return (
                <span
                  key={point.text}
                  className="inline-flex items-center gap-2"
                >
                  <Icon className="size-4 text-primary" />
                  {point.text}
                </span>
              );
            })}
          </div>

          {/* Illustration */}
          <div className="relative mt-10 max-w-2xl">
            <div className="absolute inset-x-[10%] bottom-[5%] h-[50%] rounded-full bg-primary/10 blur-3xl" />

            <Image
              src="/illustrations/protected-private.webp"
              alt="Documents protected inside SafeDrop"
              width={760}
              height={520}
              priority
              className="relative h-auto w-full drop-shadow-[0_28px_38px_rgba(15,75,66,0.13)]"
            />

            <div className="absolute right-[2%] bottom-[13%] rounded-2xl border bg-background/88 px-4 py-3 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <ShieldCheckIcon className="size-4" />
                </span>

                <div>
                  <p className="text-xs text-muted-foreground">Your account</p>
                  <p className="text-sm font-semibold">Drops under control</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AUTH CARD */}
        <section className="mx-auto w-full max-w-[30rem]">
          <div className="relative">
            <div className="absolute inset-x-[8%] bottom-[-7%] -z-10 h-[60%] rounded-full bg-primary/8 blur-3xl" />

            <div className="rounded-[2rem] border bg-card/96 p-6 shadow-[0_30px_90px_-55px_rgba(14,45,40,0.55)] backdrop-blur-sm sm:p-9">
              <Badge
                variant="secondary"
                className="mb-6 rounded-full border-primary/15 px-3 py-1.5 text-primary lg:hidden"
              >
                {eyebrow}
              </Badge>

              <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                {title}
              </h1>

              <p className="mt-3 leading-7 text-muted-foreground">
                {description}
              </p>

              <div className="mt-8">{children}</div>
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
              SafeDrop accounts are designed for managing temporary shares—not
              keeping them around forever.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
