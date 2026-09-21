"use client"

import { Upload02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { notify } from "@/src/lib/notify"

import { TEMPLATES } from "./sample"

const PAPER_LINES = 5

/**
 * Kartu per template: pratinjau mini, nama, berkas, tombol Preview yang membuka
 * PDF-nya di tab baru, dan ikon ganti berkas (hanya tombol - fase slicing).
 */
export function TemplateGrid() {
  return (
    <div className="grid-3">
      {TEMPLATES.map((t) => (
        <article key={t.id} className="card stack">
          <Paper title={t.name} />

          <div className="stack" style={{ gap: 2 }}>
            <h2 className="h6">{t.name}</h2>
            <span className="caption text-muted">{t.file}</span>
          </div>

          <div className="row">
            <a
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
              href={`/files/${t.file}`}
              target="_blank"
              rel="noopener"
            >
              Preview
            </a>
            <button
              type="button"
              className="btn btn-ghost btn-icon btn-sm"
              aria-label={`Ganti berkas ${t.name}`}
              title="Ganti berkas"
              onClick={() => notify.info(`Unggah versi baru ${t.name} belum tersedia.`)}
            >
              <HugeiconsIcon icon={Upload02Icon} size={16} strokeWidth={1.5} />
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

// Pratinjau mini: selembar "kertas" dengan judul dan baris-baris redup, supaya
// kartu terbaca sebagai dokumen, bukan kotak kosong.
function Paper({ title }: { title: string }) {
  return (
    <div
      className="card-soft row"
      style={{
        justifyContent: "center",
        aspectRatio: "16 / 10",
        border: "1px dashed var(--color-hairline)",
        padding: 16,
      }}
      aria-hidden
    >
      <div
        className="stack"
        style={{
          gap: 6,
          width: "56%",
          height: "100%",
          padding: 12,
          background: "var(--color-canvas)",
          border: "1px solid var(--color-hairline-soft)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <span className="caption text-faint" style={{ fontSize: 8, letterSpacing: 1 }}>
          MAXIMA STIFTUNG
        </span>
        <span className="text-ink" style={{ fontSize: 10, fontWeight: 600, lineHeight: 1.2 }}>
          {title}
        </span>
        {Array.from({ length: PAPER_LINES }, (_, i) => (
          <span
            key={i}
            style={{
              height: 4,
              width: `${90 - ((i * 23) % 40)}%`,
              background: "var(--color-hairline)",
              borderRadius: 2,
            }}
          />
        ))}
      </div>
    </div>
  )
}
