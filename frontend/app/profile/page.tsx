import type { Metadata } from "next";
import Image from "next/image";
import { CalendarDaysIcon, KeyRoundIcon, ShieldCheckIcon } from "lucide-react";

import { AuthenticatedShell } from "@/components/app/authenticated-shell";
import { LogoutButton } from "@/components/auth/logout-button";
import { ProfileForm } from "@/components/profile/profile-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "@/lib/drop-utils";
import { requireCurrentUser } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireCurrentUser();
  return (
    <AuthenticatedShell user={user}>
      <div className="space-y-7">
        <header>
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">Account</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Profile</h1>
          <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">Keep the name connected to your SafeDrop account up to date.</p>
        </header>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
          <Card className="gap-4 p-1 shadow-none ring-border">
            <CardHeader className="px-5 pt-5 sm:px-7 sm:pt-7"><CardTitle className="text-xl">Profile information</CardTitle><p className="text-sm leading-6 text-muted-foreground">Only your first and last name can currently be changed.</p></CardHeader>
            <CardContent className="px-5 pb-5 sm:px-7 sm:pb-7"><ProfileForm user={user} /></CardContent>
          </Card>
          <div className="space-y-5">
            <div className="overflow-hidden rounded-3xl border bg-primary-soft/35 p-5"><Image src="/illustrations/protected-private.webp" alt="Private account information protected by SafeDrop" width={480} height={320} className="h-auto w-full" /></div>
            <Card className="gap-4 p-5 shadow-none ring-border sm:p-6">
              <div className="flex items-center justify-between gap-3"><CardTitle>Account details</CardTitle><Badge variant="secondary" className="rounded-full text-primary"><ShieldCheckIcon /> {user.type === "admin" ? "Admin" : "Client"}</Badge></div>
              <Separator />
              <div className="flex gap-3"><CalendarDaysIcon className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="text-sm font-medium">Member since</p><p className="mt-1 text-sm text-muted-foreground">{user.created_at ? formatDateTime(user.created_at) : "Account date unavailable"}</p></div></div>
              <div className="flex gap-3"><KeyRoundIcon className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="text-sm font-medium">Session</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Signing out ends this browser session. Password changes are not currently available.</p></div></div>
              <LogoutButton className="h-10 w-full border bg-background px-3 hover:bg-muted" />
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  );
}
