"use client";

import { Statistics } from "@/app/actions/getStatistics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatVnd } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

// Convert to K, M, B
function convertNumberToShortString(num: number) {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(0)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(0)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(0)}K`;
  }
  return num.toString();
}

export function TransactionStatisticByAmount({
  histogram,
}: {
  histogram: Statistics["histogram"];
}) {
  const chartData = histogram.map((item) => ({
    month: `${convertNumberToShortString(
      item.min
    )} - ${convertNumberToShortString(item.max)}`,
    desktop: item.count,
  }));
  const chartConfig = {
    desktop: { label: "Số lượng giao dịch", color: "hsl(var(--chart-1))" },
  } satisfies ChartConfig;

  return (
    <Card className="md:w-1/2">
      <CardHeader>
        <CardTitle>Số lượng giao dịch theo khối lượng</CardTitle>
        <CardDescription>0 - 1.000.000.000</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              fontSize={10}
            />
            <YAxis
              padding={{ top: 16 }}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickCount={4}
              tickFormatter={formatVnd}
            />
            <ChartTooltip
              cursor={false}
              // content use XAxis dataKey and y value
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
