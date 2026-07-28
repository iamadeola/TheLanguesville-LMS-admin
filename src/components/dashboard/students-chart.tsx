"use client";

import { Box } from "@chakra-ui/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

interface StudentsChartProps {
  /** `x` is a display label ("Jan", "Mon", "14"), not a number. */
  data: Array<{ x: string; value: number }>;
  height?: number;
}

export function StudentsChart({ data, height = 280 }: StudentsChartProps) {
  return (
    <Box w="full" h={`${height}px`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          // Enough side margin that the first/last x labels ("Aug", "Jul")
          // aren't clipped by the plot edge.
          margin={{ top: 10, right: 16, left: 12, bottom: 0 }}
        >
          <defs>
            <linearGradient id="studentsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F97461" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#F97461" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="#F3F4F6"
            strokeDasharray="0"
            vertical={false}
          />
          <XAxis
            dataKey="x"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            // 7-day and 12-month series are short enough to label fully; a
            // 30-day one crowds, so drop every other tick.
            interval={data.length > 14 ? 1 : 0}
          />
          <Tooltip
            cursor={{ stroke: "#F97461", strokeWidth: 1, strokeDasharray: "4" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #E5E7EB",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            name="Students"
            stroke="#F97461"
            strokeWidth={2}
            fill="url(#studentsGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
