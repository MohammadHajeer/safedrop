import Link from "next/link";
import { ArrowRightIcon, LayoutDashboardIcon } from "lucide-react";

import { SafeDropLogo } from "@/components/public/safedrop-logo";
import { ThemeToggle } from "@/components/public/theme-toggle";
import { ButtonLink } from "@/components/ui/button-link";
import { getCurrentUser } from "@/lib/server/auth";

export async function PublicShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  const createHref = user ? "/dashboard/drops/new" : "/create";

  return (
    <div className="flex min-h-dvh flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex h-16 w-full max-w-[90rem] items-center px-4 sm:h-[72px] sm:px-6 lg:px-10">
          <SafeDropLogo />

          <nav
            aria-label="Primary navigation"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex"
          >
            <ButtonLink
              variant="ghost"
              href="/#how-it-works"
              className="text-muted-foreground hover:text-foreground"
            >
              How it works
            </ButtonLink>

            <ButtonLink
              variant="ghost"
              href="/#privacy"
              className="text-muted-foreground hover:text-foreground"
            >
              Privacy
            </ButtonLink>
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />

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
              href={createHref}
              className="h-10 rounded-full px-4 shadow-sm sm:px-5"
            >
              <span className="sm:hidden">Create</span>
              <span className="hidden sm:inline">Create a Drop</span>
              <ArrowRightIcon data-icon="inline-end" />
            </ButtonLink>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col">{children}</div>

      {/* FOOTER */}
      <footer className="border-t bg-card/35">
        <div className="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
          <div className="grid gap-10 sm:grid-cols-[1.4fr_0.8fr_0.8fr]">
            {/* BRAND */}
            <div className="max-w-sm">
              <SafeDropLogo className="opacity-95" />

              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Secure, temporary sharing for text and files—with expiration and
                view limits built in.
              </p>
            </div>

            {/* PRODUCT */}
            <div>
              <p className="text-sm font-semibold">Product</p>

              <nav
                aria-label="Product navigation"
                className="mt-4 flex flex-col items-start gap-3 text-sm text-muted-foreground"
              >
                <Link
                  href="/#how-it-works"
                  className="transition-colors hover:text-foreground"
                >
                  How it works
                </Link>

                <Link
                  href="/#privacy"
                  className="transition-colors hover:text-foreground"
                >
                  Privacy
                </Link>

                <Link
                  href={createHref}
                  className="transition-colors hover:text-foreground"
                >
                  Create a Drop
                </Link>
              </nav>
            </div>

            {/* ACCOUNT */}
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
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} SafeDrop</p>

            <p>Temporary sharing, thoughtfully designed.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
