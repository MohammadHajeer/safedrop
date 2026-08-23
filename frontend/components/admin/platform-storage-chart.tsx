"use client";

import { RadialBar, RadialBarChart } from "recharts";

import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { formatBytes } from "@/lib/drop-utils";
import type { StorageUsage } from "@/lib/api/stats";

const chartConfig = {
  usage: { label: "Physical storage", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function PlatformStorageChart({ usage }: { usage: StorageUsage }) {
  const percent = Math.min(Math.max(usage.percentage, 0), 100);
  const data = [{ name: "usage", value: percent, fill: "var(--color-usage)" }];

  return (
    <div className="grid items-center gap-5 sm:grid-cols-[170px_1fr]">
      <div className="relative mx-auto size-[170px]">
        <ChartContainer
          config={chartConfig}
          initialDimension={{ width: 170, height: 170 }}
          className="aspect-square size-[170px]"
          aria-label={`${percent.toFixed(1)} percent of platform storage used`}
        >
          <RadialBarChart
            data={data}
            startAngle={90}
            endAngle={90 - (360 * percent) / 100}
            innerRadius={62}
            outerRadius={80}
          >
            <RadialBar
              dataKey="value"
              background={{ fill: "var(--muted)" }}
              cornerRadius={9}
            />
          </RadialBarChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tracking-tight tabular-nums">
            {percent < 1 && percent > 0 ? "<1" : Math.round(percent)}%
          </span>
          <span className="text-xs text-muted-foreground">used</span>
        </div>
      </div>
      <div>
        <p className="text-xl font-semibold tracking-tight">
          {formatBytes(usage.used_bytes)} stored
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          of {formatBytes(usage.limit_bytes)} platform capacity
        </p>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {formatBytes(usage.remaining_bytes)} remains. This measures platform
          objects awaiting physical cleanup, not a user&apos;s active-Drop
          quota.
        </p>
      </div>
    </div>
  );
}
