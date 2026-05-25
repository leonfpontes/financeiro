"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatBRL } from "@/lib/utils/currency";

interface BalanceData {
  year: number;
  month: number;
  balance: number;
}

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="text-slate-500 text-xs mb-0.5">{label}</p>
      <p className={`font-mono font-bold ${value >= 0 ? "text-indigo-600" : "text-rose-500"}`}>
        {formatBRL(Number(value))}
      </p>
    </div>
  );
};

export function BalanceLineChart({ data }: { data: BalanceData[] }) {
  const chartData = data.map((d) => ({
    name: `${MONTH_NAMES[d.month - 1]}/${String(d.year).slice(2)}`,
    Saldo: d.balance,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e2e8f0" }} />
        <Area
          type="monotone"
          dataKey="Saldo"
          stroke="#6366f1"
          strokeWidth={2.5}
          fill="url(#balanceGradient)"
          dot={{ fill: "#6366f1", strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
