"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TopWorkersChartProps {
  data: { id: string; name: string; earnings: number }[];
}

export function TopWorkersChart({ data }: TopWorkersChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Workers (By Earnings)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `UGX ${value}`} />
            <Tooltip
              formatter={(value: number) => [`UGX ${value.toLocaleString()}`, "Earnings"]}
            />
            <Bar dataKey="earnings" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

