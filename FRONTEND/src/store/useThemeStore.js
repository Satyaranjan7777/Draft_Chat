import { create } from "zustand";

export const THEME_STORAGE_KEY = "chat-app-theme";
export const DEFAULT_THEME = "light";

const getStoredTheme = () => {
  if (typeof window === "undefined") return DEFAULT_THEME;
  return window.localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
};

const applyTheme = (theme) => {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme);
  }
};

const initialTheme = getStoredTheme();
applyTheme(initialTheme);

export const useThemeStore = create((set) => ({
  theme: initialTheme,
  setTheme: (theme) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
    set({ theme });
  },
  resetTheme: () => {
    window.localStorage.removeItem(THEME_STORAGE_KEY);
    applyTheme(DEFAULT_THEME);
    set({ theme: DEFAULT_THEME });
  },
}));
