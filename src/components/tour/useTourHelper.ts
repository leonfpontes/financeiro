"use client";

import { useEffect } from "react";
import { useTour } from "@reactour/tour";

const TOUR_KEY = "financeiro_tour_seen";

export function useAutoOpenTour() {
  const { setIsOpen, setCurrentStep } = useTour();

  useEffect(() => {
    try {
      if (!localStorage.getItem(TOUR_KEY)) {
        const timer = setTimeout(() => {
          setCurrentStep(0);
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable (SSR/private mode)
    }
  }, [setIsOpen, setCurrentStep]);
}
