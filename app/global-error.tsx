"use client"

import "@/src/styles/lib/index.scss"
import "./globals.css"

import { Logo } from "@/src/components/brand/Logo"

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="id">
      <body>
        <div
          style={{
            minHeight: "100dvh",
            display: "grid",
            placeItems: "center",
            padding: 32,
            backgroundColor: "var(--canvas)",
          }}
        >
          <div style={{ width: "100%", maxWidth: 420, display: "grid", gap: 32 }}>
            <Logo height={56} />
            <div style={{ display: "grid", gap: 12 }}>
              <span className="label text-faint">Galat 500</span>
              <h1 className="h2">Ada yang tidak beres di sisi kami.</h1>
              <p className="text-muted" style={{ maxWidth: "46ch" }}>
                Aplikasi gagal dimuat. Muat ulang halaman ini; kalau masih sama, hubungi staf
                Maxima.
              </p>
            </div>
            <div>
              <button type="button" className="btn btn-primary" onClick={reset}>
                Muat ulang
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
