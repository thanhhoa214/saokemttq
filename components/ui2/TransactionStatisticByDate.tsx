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
import { format } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

export function TransactionStatisticByDate({
  histogramDate,
}: {
  histogramDate: Statistics["histogramDate"];
}) {
  const chartData = histogramDate.map((item) => ({
    month: format(item.date, "dd/MM"),
    desktop: item._count._all,
  }));
  const chartConfig = {
    desktop: { label: "Số lượng giao dịch", color: "hsl(var(--chart-1))" },
  } satisfies ChartConfig;

  return (
    <Card className="md:w-1/2">
      <CardHeader>
        <CardTitle>Số lượng giao dịch trên ngày</CardTitle>
        <CardDescription>01/09/2024 - 10/09/2024</CardDescription>
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
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8}>
              <LabelList
                position="top"
                offset={8}
                fontSize={12}
                className="fill-foreground"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
