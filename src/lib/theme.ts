export type WhisprTheme = "bubblegum" | "mint" | "peach";

const paletteByTheme: Record<WhisprTheme, { background: string; primary: string; accent: string; bubble: string }> = {
  bubblegum: {
    background: "oklch(0.975 0.022 330)",
    primary: "oklch(0.72 0.17 350)",
    accent: "oklch(0.86 0.1 290)",
    bubble: "oklch(0.93 0.07 340)",
  },
  mint: {
    background: "oklch(0.965 0.045 165)",
    primary: "oklch(0.68 0.17 170)",
    accent: "oklch(0.85 0.09 200)",
    bubble: "oklch(0.89 0.07 180)",
  },
  peach: {
    background: "oklch(0.977 0.035 36)",
    primary: "oklch(0.74 0.18 25)",
    accent: "oklch(0.89 0.09 50)",
    bubble: "oklch(0.92 0.06 35)",
  },
};

export function applyWhisprTheme(theme: string, motionOn: boolean) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const activeTheme = Object.keys(paletteByTheme).includes(theme) ? (theme as WhisprTheme) : "bubblegum";
  const palette = paletteByTheme[activeTheme];

  root.classList.remove("theme-bubblegum", "theme-mint", "theme-peach");
  root.classList.add(`theme-${activeTheme}`);
  root.dataset["whisprTheme"] = activeTheme;
  root.dataset["whisprMotion"] = motionOn ? "on" : "off";

  root.style.setProperty("--background", palette.background);
  root.style.setProperty("--primary", palette.primary);
  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--bubble", palette.bubble);
}

export function getStoredThemePreference(): WhisprTheme {
  if (typeof window === "undefined") return "bubblegum";
  const saved = localStorage.getItem("whispr-theme");
  return saved && saved in paletteByTheme ? (saved as WhisprTheme) : "bubblegum";
}

export function initializeWhisprTheme() {
  if (typeof window === "undefined") return;
  const savedTheme = getStoredThemePreference();
  const motionOn = localStorage.getItem("whispr-motion") !== "off";
  applyWhisprTheme(savedTheme, motionOn);
}
