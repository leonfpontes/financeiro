"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatBRL } from "@/lib/utils/currency";

interface MonthData {
  year: number;
  month: number;
  income: number;
  expense: number;
}

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-3 py-2.5 text-sm min-w-[160px]">
      <p className="font-semibold text-slate-600 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
            <span className="text-slate-500 text-xs">{p.dataKey}</span>
          </div>
          <span className="font-mono font-semibold text-slate-800 text-xs">{formatBRL(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export function MonthlyBarChart({ data }: { data: MonthData[] }) {
  const chartData = data.map((d) => ({
    name: `${MONTH_NAMES[d.month - 1]}/${String(d.year).slice(2)}`,
    Receitas: d.income,
    Despesas: d.expense,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ fontSize: 12, color: "#64748b" }}>{value}</span>}
        />
        <Bar dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
