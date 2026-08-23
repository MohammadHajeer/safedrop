import { Badge } from "@/components/ui/badge";
import type { DropStatus } from "@/lib/api/drops";
import { statusLabels } from "@/lib/drop-utils";
import { cn } from "@/lib/utils";

const styles: Record<DropStatus, string> = {
  active: "border-primary/20 bg-primary-soft text-primary",
  expired: "border-border bg-muted text-muted-foreground",
  consumed: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  revoked: "border-destructive/20 bg-destructive/10 text-destructive",
};

export function DropStatusBadge({ status, className }: { status: DropStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 font-medium", styles[status], className)}>
      {statusLabels[status]}
    </Badge>
  );
}
