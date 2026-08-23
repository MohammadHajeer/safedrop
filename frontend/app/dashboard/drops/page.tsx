import type { Metadata } from "next";
import { PlusIcon } from "lucide-react";
import { Suspense } from "react";

import { DropsList, DropsListSkeleton } from "@/components/drops/drops-list";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = { title: "My Drops" };

export default function DropsPage() {
  return (
    <div className="space-y-7">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            Manage
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            My Drops
          </h1>
          <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
            Search, review, update, or revoke the temporary shares you own.
          </p>
        </div>
        <ButtonLink
          href="/dashboard/drops/new"
          size="lg"
          className="h-11 rounded-full px-5"
        >
          <PlusIcon /> Create Drop
        </ButtonLink>
      </header>
      <Suspense fallback={<DropsListSkeleton />}>
        <DropsList />
      </Suspense>
    </div>
  );
}
