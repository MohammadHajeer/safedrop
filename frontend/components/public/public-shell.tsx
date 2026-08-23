import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { SafeDropLogo } from "@/components/public/safedrop-logo";
import { ThemeToggle } from "@/components/public/theme-toggle";
import { ButtonLink } from "@/components/ui/button-link";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/92 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:h-[72px] sm:px-6 lg:px-8">
          <SafeDropLogo />

          <nav
            aria-label="Primary navigation"
            className="ml-auto hidden items-center gap-1 md:flex"
          >
            <ButtonLink variant="ghost" href="/#how-it-works">
              How it works
            </ButtonLink>
            <ButtonLink variant="ghost" href="/#privacy">
              Privacy
            </ButtonLink>
          </nav>

          <div className="ml-auto flex items-center gap-1 md:ml-2 sm:gap-2">
            <ThemeToggle />
            <ButtonLink
              variant="ghost"
              href="/login"
              className="hidden h-10 px-2 min-[360px]:inline-flex sm:px-3"
            >
              Sign in
            </ButtonLink>
            <ButtonLink
              href="/create"
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

      <footer className="border-t bg-card/40">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <SafeDropLogo className="opacity-90" />
            <span className="hidden h-5 w-px bg-border sm:block" />
            <span>Temporary sharing, thoughtfully designed.</span>
          </div>
          <nav
            aria-label="Footer navigation"
            className="flex items-center gap-5"
          >
            <Link
              className="transition-colors hover:text-foreground"
              href="/create"
            >
              Create a Drop
            </Link>
            <Link
              className="transition-colors hover:text-foreground"
              href="/login"
            >
              Sign in
            </Link>
            <Link
              className="transition-colors hover:text-foreground"
              href="/register"
            >
              Register
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
