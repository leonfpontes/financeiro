export type InsightLevel = "danger" | "warning" | "success" | "info" | "tip";

export interface Insight {
  id: string;
  level: InsightLevel;
  /** Short headline — max ~50 chars */
  title: string;
  /** 1–2 sentences of consultant-style advice */
  body: string;
  /** Key metric shown as a chip (e.g. "87%", "R$ 1.200") */
  metric?: string;
  /** Label for the optional action button */
  action?: string;
  /** href for the action (internal Next.js route) */
  actionHref?: string;
  /** Lower number = higher priority (shown first) */
  priority: number;
}
