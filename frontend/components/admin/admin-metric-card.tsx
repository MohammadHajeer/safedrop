import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function AdminMetricCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="gap-0 p-1 shadow-none ring-border">
      <CardContent className="p-5 sm:p-6">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <p className="mt-6 text-3xl font-semibold tracking-tight tabular-nums">
          {value.toLocaleString()}
        </p>
        <p className="mt-1 text-sm font-medium">{label}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
