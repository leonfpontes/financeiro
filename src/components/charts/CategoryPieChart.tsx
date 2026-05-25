"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Label } from "recharts";
import { formatBRL } from "@/lib/utils/currency";

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
        <span className="font-medium text-slate-700">{name}</span>
      </div>
      <p className="font-mono font-bold text-slate-800 mt-0.5">{formatBRL(Number(value))}</p>
    </div>
  );
};

export function CategoryPieChart({ data }: { data: CategoryData[] }) {
  if (!data.length) return <p className="text-center text-slate-500 py-8">Sem dados para o período</p>;

  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={72}
          outerRadius={110}
          dataKey="value"
          paddingAngle={2}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="transparent" />
          ))}
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <g>
                    <text
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) - 8}
                      textAnchor="middle"
                      style={{ fontSize: 17, fontWeight: 700, fill: "#1e293b", fontFamily: "var(--font-sans)" }}
                    >
                      {formatBRL(total)}
                    </text>
                    <text
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 11}
                      textAnchor="middle"
                      style={{ fontSize: 11, fill: "#94a3b8", fontFamily: "var(--font-sans)" }}
                    >
                      despesas
                    </text>
                  </g>
                );
              }
            }}
            position="center"
          />
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ fontSize: 12, color: "#64748b" }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
