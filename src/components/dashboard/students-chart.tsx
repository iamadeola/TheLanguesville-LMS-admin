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
  data: Array<{ day: number; students: number }>;
  height?: number;
}

export function StudentsChart({ data, height = 280 }: StudentsChartProps) {
  return (
    <Box w="full" h={`${height}px`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
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
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            interval={1}
            tickFormatter={(value: number) =>
              value % 2 === 0 ? String(value) : ""
            }
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
            dataKey="students"
            stroke="#F97461"
            strokeWidth={2}
            fill="url(#studentsGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
