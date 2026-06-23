import { useState, useCallback } from "react";
import type { PixelGrid } from "@/types";

const MAX_HISTORY = 50;

export function useUndoRedo(initial: PixelGrid) {
  const [history, setHistory] = useState<PixelGrid[]>([initial]);
  const [index, setIndex] = useState(0);

  const current = history[index];

  const set = useCallback((newGrid: PixelGrid) => {
    setHistory((h) => {
      const trimmed = h.slice(0, index + 1);
      const next = [...trimmed, newGrid].slice(-MAX_HISTORY);
      return next;
    });
    setIndex((i) => Math.min(i + 1, MAX_HISTORY - 1));
  }, [index]);

  const undo = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const redo = useCallback(() => {
    setIndex((i) => Math.min(history.length - 1, i + 1));
  }, [history.length]);

  const canUndo = index > 0;
  const canRedo = index < history.length - 1;

  return { grid: current, set, undo, redo, canUndo, canRedo };
}
