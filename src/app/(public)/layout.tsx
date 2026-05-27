import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GranaMinha Grátis - Controle Financeiro Pessoal",
  description:
    "Organize entradas, gastos, compromissos, cartões e evolução financeira em um único lugar. Comece grátis agora.",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return children;
}
