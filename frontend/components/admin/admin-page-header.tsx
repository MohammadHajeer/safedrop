import type { LucideIcon } from "lucide-react";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div className="max-w-3xl">
        <p className="flex items-center gap-2 text-sm font-semibold tracking-wide text-primary uppercase">
          <Icon className="size-4" aria-hidden="true" /> {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 leading-7 text-muted-foreground">{description}</p>
      </div>
      {action}
    </header>
  );
}
