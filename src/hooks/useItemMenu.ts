"use client";

import { useState } from "react";

interface UseItemMenuResult<T> {
  anchor: HTMLElement | null;
  item: T | null;
  open: (event: React.MouseEvent<HTMLElement>, item: T) => void;
  close: () => void;
}

/**
 * Manages the anchor element and active item for a MoreVert/context menu.
 * Generic over T so callers get the correct item type back.
 */
export function useItemMenu<T>(): UseItemMenuResult<T> {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [item, setItem] = useState<T | null>(null);

  const open = (event: React.MouseEvent<HTMLElement>, target: T) => {
    setAnchor(event.currentTarget);
    setItem(target);
  };

  const close = () => {
    setAnchor(null);
    setItem(null);
  };

  return { anchor, item, open, close };
}
