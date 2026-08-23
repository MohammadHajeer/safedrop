"use client";

import { RadialBar, RadialBarChart } from "recharts";

import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import type { StorageUsage } from "@/lib/api/stats";
import { formatBytes } from "@/lib/drop-utils";

const chartConfig = {
  usage: { label: "Used storage", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function StorageUsageChart({ usage }: { usage: StorageUsage }) {
  const percent = Math.min(Math.max(usage.percentage, 0), 100);
  const data = [{ name: "usage", value: percent, fill: "var(--color-usage)" }];

  return (
    <div className="grid items-center gap-4 sm:grid-cols-[150px_1fr]">
      <div className="relative mx-auto size-[150px]">
        <ChartContainer
          config={chartConfig}
          initialDimension={{ width: 150, height: 150 }}
          className="aspect-square size-[150px]"
        >
          <RadialBarChart
            data={data}
            startAngle={90}
            endAngle={90 - (360 * percent) / 100}
            innerRadius={55}
            outerRadius={71}
          >
            <RadialBar
              dataKey="value"
              background={{ fill: "var(--muted)" }}
              cornerRadius={8}
            />
          </RadialBarChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tracking-tight tabular-nums">
            {Math.round(percent)}%
          </span>
          <span className="text-xs text-muted-foreground">used</span>
        </div>
      </div>
      <div>
        <p className="text-xl font-semibold tracking-tight">
          {formatBytes(usage.used_bytes)} used
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          of {formatBytes(usage.limit_bytes)} active storage
        </p>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {formatBytes(usage.remaining_bytes)} remains for files on active
          Drops.
        </p>
      </div>
    </div>
  );
}
