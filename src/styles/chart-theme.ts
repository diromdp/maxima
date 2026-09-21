import { themes, type ChartTheme, type ThemeName } from "@derpdaderp/chartkit"

export const CHART_THEME: ThemeName = "pearl"

export const CHART_COLORS = {
  success: "#2f7d51",
  warning: "#96660c",
  danger: "#b4474b",
  info: "#2f6fa8",
  neutral: "#8f8f93",
  accent: "#0066ff",
  ink: "#101010",
} as const

const SERIES = [
  CHART_COLORS.success,
  CHART_COLORS.danger,
  CHART_COLORS.info,
  CHART_COLORS.warning,
  CHART_COLORS.neutral,
  CHART_COLORS.ink,
]

const maxima: ChartTheme = {
  name: "Maxima",
  bg: "#ffffff",
  bgSecondary: "#fafafa",
  bgCard: "#ffffff",
  text: "#101010",
  textSecondary: "#707070",
  textMuted: "#adadad",
  border: "#e2e2e4",
  gridLine: "#ececed",
  colors: SERIES,
  series: SERIES,
  accent: CHART_COLORS.info,
  positive: CHART_COLORS.success,
  negative: CHART_COLORS.danger,
  baseline: "#e2e2e4",
}

themes[CHART_THEME] = maxima

export function chartSeriesColor(index: number): string {
  return SERIES[index % SERIES.length]
}

export function deltaColor(delta: number, goodWhen: "up" | "down" = "up"): string {
  if (delta === 0) return CHART_COLORS.neutral
  const isGood = goodWhen === "up" ? delta > 0 : delta < 0
  return isGood ? CHART_COLORS.success : CHART_COLORS.danger
}
