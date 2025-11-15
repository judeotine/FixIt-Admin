"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface ServiceDistributionChartProps {
  data: { category: string; count: number; value: number }[];
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary))",
  "hsl(var(--primary))",
  "hsl(var(--primary))",
  "hsl(var(--primary))",
];

export function ServiceDistributionChart({
  data,
}: ServiceDistributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Category Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${((percent || 0) * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

