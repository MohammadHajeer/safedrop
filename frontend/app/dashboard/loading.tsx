import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-7" aria-label="Loading page">
      <div className="space-y-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full max-w-md" /><Skeleton className="h-5 w-full max-w-xl" /></div>
      <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-48 rounded-2xl" /><Skeleton className="h-48 rounded-2xl" /><Skeleton className="h-48 rounded-2xl" /></div>
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  );
}
