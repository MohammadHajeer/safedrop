"use client";

import { ArrowRightIcon, LayoutDashboardIcon } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function AuthAwareHeaderActions() {
  const { data: user, isError, isPending } = useCurrentUser();

  if (isPending || isError) {
    return (
      <div
        className="flex items-center gap-1.5 sm:gap-2"
        aria-label="Loading account navigation"
      >
        <Skeleton className="hidden h-10 w-24 rounded-lg min-[390px]:block" />
        <Skeleton className="h-10 w-29 rounded-full sm:w-36" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {user ? (
        <ButtonLink
          variant="ghost"
          href="/dashboard"
          className="hidden h-10 px-3 min-[390px]:inline-flex"
        >
          <LayoutDashboardIcon />
          <span className="hidden sm:inline">Dashboard</span>
        </ButtonLink>
      ) : (
        <ButtonLink
          variant="ghost"
          href="/login"
          className="hidden h-10 px-3 min-[390px]:inline-flex"
        >
          Sign in
        </ButtonLink>
      )}

      <ButtonLink
        href={user ? "/dashboard/drops/new" : "/create"}
        className="h-10 rounded-full px-4 shadow-sm sm:px-5"
      >
        <span className="sm:hidden">Create</span>
        <span className="hidden sm:inline">Create a Drop</span>
        <ArrowRightIcon data-icon="inline-end" />
      </ButtonLink>
    </div>
  );
}

export function AuthAwareFooterNavigation() {
  const { data: user, isError, isPending } = useCurrentUser();

  if (isPending || isError) {
    return (
      <div aria-label="Loading account links">
        <p className="text-sm font-semibold">Account</p>
        <div className="mt-4 space-y-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-18" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold">
        {user ? "Account" : "Get started"}
      </p>

      <nav
        aria-label="Account navigation"
        className="mt-4 flex flex-col items-start gap-3 text-sm text-muted-foreground"
      >
        {user ? (
          <>
            <Link
              href="/dashboard"
              className="transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/drops"
              className="transition-colors hover:text-foreground"
            >
              My Drops
            </Link>
            <Link
              href="/profile"
              className="transition-colors hover:text-foreground"
            >
              Profile
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="transition-colors hover:text-foreground"
            >
              Create account
            </Link>
            <Link
              href="/create"
              className="transition-colors hover:text-foreground"
            >
              Continue as guest
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}

export function AuthAwareCreateLink() {
  const { data: user, isError, isPending } = useCurrentUser();

  if (isPending || isError) {
    return <Skeleton className="h-5 w-24" aria-label="Loading create link" />;
  }

  return (
    <Link
      href={user ? "/dashboard/drops/new" : "/create"}
      className="transition-colors hover:text-foreground"
    >
      Create a Drop
    </Link>
  );
}

type AuthAwareButtonLinkProps = Omit<
  React.ComponentProps<typeof ButtonLink>,
  "children" | "href"
> & {
  guestHref: string;
  authenticatedHref: string;
  children: React.ReactNode;
  authenticatedChildren?: React.ReactNode;
};

export function AuthAwareButtonLink({
  guestHref,
  authenticatedHref,
  children,
  authenticatedChildren = children,
  className,
  size,
  variant,
  ...props
}: AuthAwareButtonLinkProps) {
  const { data: user, isError, isPending } = useCurrentUser();

  if (isPending || isError) {
    return (
      <span
        className={cn(
          buttonVariants({ size, variant }),
          "pointer-events-none animate-pulse bg-muted text-transparent shadow-none",
          className,
        )}
        aria-label="Loading action"
      >
        <span className="invisible">{children}</span>
      </span>
    );
  }

  return (
    <ButtonLink
      {...props}
      href={user ? authenticatedHref : guestHref}
      className={className}
      size={size}
      variant={variant}
    >
      {user ? authenticatedChildren : children}
    </ButtonLink>
  );
}
