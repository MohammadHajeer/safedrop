import type { User } from "@/lib/auth-types";

import { DesktopNavigation, MobileNavigation } from "./app-navigation";

export function AuthenticatedShell({ user, children }: { user: User; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh lg:flex">
      <DesktopNavigation user={user} />
      <div className="min-w-0 flex-1">
        <MobileNavigation user={user} />
        <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
