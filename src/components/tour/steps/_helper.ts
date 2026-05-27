import type { StepType } from "@reactour/tour";
import type { TourStepMeta } from "../types";

export function step(
  meta: TourStepMeta,
  selector: string,
  position: StepType["position"] = "bottom",
): StepType {
  return { selector, content: meta as unknown as string, position };
}
