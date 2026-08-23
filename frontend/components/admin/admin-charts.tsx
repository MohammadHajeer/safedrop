"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { AdminStats } from "@/lib/api/admin";

const statusConfig = {
  count: { label: "Drops", color: "var(--chart-1)" },
} satisfies ChartConfig;

const sourceConfig = {
  count: { label: "Drops", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function DropStatusChart({ stats }: { stats: AdminStats }) {
  const data = [
    { status: "Active", count: stats.active_drops },
    { status: "Expired", count: stats.expired_drops },
    { status: "Consumed", count: stats.consumed_drops },
    { status: "Revoked", count: stats.revoked_drops },
  ];

  return (
    <ChartContainer
      config={statusConfig}
      initialDimension={{ width: 540, height: 260 }}
      className="h-[260px] w-full"
      aria-label="Drop totals by status"
    >
      <BarChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="status" tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

export function DropSourceChart({ stats }: { stats: AdminStats }) {
  const data = [
    { source: "Signed-in users", count: stats.authenticated_drops },
    { source: "Guests", count: stats.guest_drops },
  ];

  return (
    <ChartContainer
      config={sourceConfig}
      initialDimension={{ width: 420, height: 260 }}
      className="h-[260px] w-full"
      aria-label="Authenticated and guest Drop totals"
    >
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 14, right: 12, left: 8, bottom: 8 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="source"
          width={98}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
