import { createContext, useContext } from 'react';

/** Lockscreen overlay fade-out duration (owned by App.tsx) */
export const OVERLAY_FADE_MS = 900;

export interface UnlockContextType {
  /** True once the lockscreen has been dismissed (pattern, skip or timeout) */
  unlocked: boolean;
}

/* Defaults to unlocked so components render normally outside the provider */
export const UnlockContext = createContext<UnlockContextType>({ unlocked: true });

export function useUnlock() {
  return useContext(UnlockContext);
}
