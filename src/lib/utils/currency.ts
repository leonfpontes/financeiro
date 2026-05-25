export function formatBRL(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export function parseMoney(value: string): number {
  return parseFloat(value.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
}
