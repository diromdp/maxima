import "@mantine/core/styles.css"
import "@mantine/dates/styles.css"
import "@mantine/notifications/styles.css"
import "@mantine/dropzone/styles.css"
import "@/src/styles/lib/index.scss"
import "./globals.css"

import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core"
import type { Metadata } from "next"
import { Montserrat, Poppins } from "next/font/google"

import { Providers } from "./providers"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Maxima Stiftung",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  description: "Sistem manajemen kursus dan penempatan kerja Jerman",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${montserrat.variable} ${poppins.variable}`} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
