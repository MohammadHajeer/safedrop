import { PackageXIcon } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";

export default function DropNotFound() {
  return (
    <section className="mx-auto max-w-xl rounded-3xl border bg-card px-6 py-14 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <PackageXIcon />
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">
        Drop not found
      </h1>
      <p className="mt-2 leading-7 text-muted-foreground">
        It may not exist, or it may belong to another account.
      </p>
      <ButtonLink
        href="/dashboard/drops"
        className="mt-6 h-11 rounded-full px-5"
      >
        Back to My Drops
      </ButtonLink>
    </section>
  );
}
