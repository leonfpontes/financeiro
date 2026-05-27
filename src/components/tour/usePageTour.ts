"use client";

import { useEffect } from "react";
import { useTour } from "@reactour/tour";
import type { StepType } from "@reactour/tour";

const TOUR_KEY = "financeiro_tour_seen";

/**
 * Hook para registrar o tour de uma página específica.
 * Deve ser chamado no nível superior do componente de página,
 * antes de qualquer early return.
 *
 * @param steps  Passos do tour desta página
 * @param autoOpen  Se true, abre automaticamente na primeira visita ao app
 */
export function usePageTour(steps: StepType[], autoOpen = false) {
  const { setSteps, setIsOpen, setCurrentStep } = useTour();

  useEffect(() => {
    // Registra os steps da página atual
    setSteps?.(steps);
    setCurrentStep(0);

    // Auto-abertura apenas no primeiro acesso ao app
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (autoOpen) {
      try {
        if (!localStorage.getItem(TOUR_KEY)) {
          timer = setTimeout(() => {
            setCurrentStep(0);
            setIsOpen(true);
          }, 1200);
        }
      } catch {
        // localStorage indisponível (SSR / modo privado)
      }
    }

    // Limpa o tour ao sair da página
    return () => {
      if (timer) clearTimeout(timer);
      setIsOpen(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
