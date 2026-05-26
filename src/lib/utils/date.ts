import { format, startOfMonth, endOfMonth, getDaysInMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

export function toYearMonth(date: Date): number {
  return date.getFullYear() * 100 + (date.getMonth() + 1);
}

export function yearMonthToDate(yearMonth: number): Date {
  const year = Math.floor(yearMonth / 100);
  const month = yearMonth % 100;
  return new Date(year, month - 1, 1);
}

export function clampDayToMonth(day: number, year: number, month: number): number {
  const maxDay = getDaysInMonth(new Date(year, month - 1, 1));
  return Math.min(day, maxDay);
}

export function getMonthRange(year: number, month: number) {
  const date = new Date(year, month - 1, 1);
  return { start: startOfMonth(date), end: endOfMonth(date) };
}

export function formatMonthYear(date: Date): string {
  return format(date, "MMMM/yyyy", { locale: ptBR });
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd/MM/yyyy");
}

export function currentYearMonth(): number {
  return toYearMonth(new Date());
}

const MESES_CURTOS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

/** "2026-05" → "Mai/2026" */
export function formatMesAno(mesAno: string): string {
  const [y, m] = mesAno.split("-");
  return `${MESES_CURTOS[Number(m) - 1]}/${y}`;
}

/** "2026-05" → "Mai/26" */
export function formatMesCurto(mesAno: string): string {
  const [y, m] = mesAno.split("-");
  return `${MESES_CURTOS[Number(m) - 1]}/${y.slice(2)}`;
}
