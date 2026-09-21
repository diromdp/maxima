"use client"

import { createTheme, type MantineColorsTuple } from "@mantine/core"

const ink: MantineColorsTuple = [
  "#f3f3f3",
  "#f0f0f0",
  "#e0e0e0",
  "#d4d4d4",
  "#adadad",
  "#8f8f8f",
  "#707070",
  "#525252",
  "#262626",
  "#101010",
]

const accent: MantineColorsTuple = [
  "#e5f0ff",
  "#cce1ff",
  "#99c2ff",
  "#66a3ff",
  "#3385ff",
  "#0066ff",
  "#005ce6",
  "#0052cc",
  "#0047b3",
  "#003d99",
]

const beres: MantineColorsTuple = [
  "#EBFBEE",
  "#D3F9D8",
  "#B2F2BB",
  "#8CE99A",
  "#69DB7C",
  "#51CF66",
  "#40C057",
  "#37B24D",
  "#2F9E44",
  "#2B8A3E",
]

const berjalan: MantineColorsTuple = [
  "#FFF9DB",
  "#FFF3BF",
  "#FFEC99",
  "#FFE066",
  "#FFD43B",
  "#FCC419",
  "#FAB005",
  "#F59F00",
  "#F08C00",
  "#E67700",
]

const tindakan: MantineColorsTuple = [
  "#FFF5F5",
  "#FFE3E3",
  "#FFC9C9",
  "#FFA8A8",
  "#FF8787",
  "#FF6B6B",
  "#FA5252",
  "#F03E3E",
  "#E03131",
  "#C92A2A",
]

const terbuka: MantineColorsTuple = [
  "#E7F5FF",
  "#D0EBFF",
  "#A5D8FF",
  "#74C0FC",
  "#4DABF7",
  "#339AF0",
  "#228BE6",
  "#1C7ED6",
  "#1971C2",
  "#1864AB",
]

export const theme = createTheme({
  primaryColor: "ink",
  primaryShade: 9,
  defaultRadius: "md",
  colors: { ink, accent, beres, berjalan, tindakan, terbuka },
  white: "#ffffff",
  black: "#101010",

  fontFamily: "var(--font-body, Poppins, sans-serif)",
  fontFamilyMonospace: "var(--font-body, Poppins, sans-serif)",
  headings: {
    fontFamily: "var(--font-heading, Montserrat, sans-serif)",
    fontWeight: "650",
    sizes: {
      h1: { fontSize: "56px", fontWeight: "650", lineHeight: "1" },
      h2: { fontSize: "44px", fontWeight: "650", lineHeight: "1.13" },
      h3: { fontSize: "32px", fontWeight: "650", lineHeight: "1.13" },
      h4: { fontSize: "24px", fontWeight: "650", lineHeight: "1.25" },
      h5: { fontSize: "20px", fontWeight: "600", lineHeight: "1.3" },
      h6: { fontSize: "16px", fontWeight: "600", lineHeight: "1.38" },
    },
  },
  lineHeights: { xs: "1.33", sm: "1.43", md: "1.38", lg: "1.38", xl: "1.3" },

  spacing: { xs: "8px", sm: "12px", md: "16px", lg: "24px", xl: "32px" },
  radius: { xs: "8px", sm: "16px", md: "24px", lg: "24px", xl: "9999px" },

  components: {
    Card: {
      defaultProps: { withBorder: true, shadow: "none", radius: "md", padding: "lg" },
    },
    Paper: {
      defaultProps: { withBorder: true, shadow: "none", radius: "md" },
    },
    Table: {
      defaultProps: {
        highlightOnHover: true,
        verticalSpacing: "sm",
        horizontalSpacing: "md",
        striped: false,
      },
    },
    Badge: {
      defaultProps: { variant: "light", radius: "xl", size: "sm" },
    },
    Button: {
      defaultProps: { radius: "xl" },
    },
    ActionIcon: {
      defaultProps: { radius: "xl" },
    },
    Chip: {
      defaultProps: { radius: "xl" },
    },
    Pill: {
      defaultProps: { radius: "xl" },
    },
    SegmentedControl: {
      defaultProps: { radius: "xl", color: "white" },
    },
    Input: {
      defaultProps: { variant: "filled", radius: "sm", size: "md" },
    },
    RadioCard: {
      defaultProps: { radius: "sm", p: "md" },
    },
    CheckboxCard: {
      defaultProps: { radius: "sm", p: "md" },
    },
    Dropzone: {
      defaultProps: { radius: "sm" },
    },
    InputWrapper: {
      defaultProps: { inputWrapperOrder: ["label", "input", "description", "error"] },
    },
    Modal: {
      defaultProps: { centered: true, radius: "md" },
    },
    Tabs: {
      defaultProps: { variant: "default" },
    },
  },
})
