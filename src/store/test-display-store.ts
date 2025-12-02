import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ContrastMode = "black-on-white" | "white-on-black" | "yellow-on-black";
export type TextSize = "regular" | "large" | "extra-large";

interface TestDisplayState {
  contrast: ContrastMode;
  textSize: TextSize;
  setContrast: (contrast: ContrastMode) => void;
  setTextSize: (textSize: TextSize) => void;
}

export const useTestDisplayStore = create<TestDisplayState>()(
  persist(
    (set) => ({
      contrast: "black-on-white",
      textSize: "regular",
      setContrast: (contrast) => set({ contrast }),
      setTextSize: (textSize) => set({ textSize }),
    }),
    {
      name: "test-display-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

