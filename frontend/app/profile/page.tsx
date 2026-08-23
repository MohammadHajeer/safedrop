import type { Metadata } from "next";

import { AuthenticatedShell } from "@/components/app/authenticated-shell";
import { ProfileClient } from "@/components/profile/profile-client";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <AuthenticatedShell>
      <div className="space-y-7">
        <header>
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            Account
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            Profile
          </h1>
          <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
            Keep the name connected to your SafeDrop account up to date.
          </p>
        </header>
        <ProfileClient />
      </div>
    </AuthenticatedShell>
  );
}
