import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  Clock01Icon,
  SquareLock02Icon,
  Upload04Icon,
} from "@hugeicons/core-free-icons"

import { PageHeader } from "@/src/components/layout/PageHeader"
import { requireSession } from "@/src/lib/auth/session"
import { Notice } from "@/src/components/ui/Notice"

import { DOCUMENT_GROUPS, isLocked, summarize, type GroupTone } from "./documents"
import { DocumentTable } from "./DocumentTable"

const HAS_VERTRAG = false

const TONE_ICON: Readonly<Record<GroupTone, typeof Upload04Icon>> = {
  beres: CheckmarkCircle02Icon,
  berjalan: Clock01Icon,
  tindakan: Upload04Icon,
  terkunci: SquareLock02Icon,
}

const CARD_LINK =
  "card stack stack-sm text-inherit no-underline transition-colors hover:border-hairline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"

export default async function DocumentsPage() {
  await requireSession("student")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Dokumen Saya"
        subtitle="Empat kelompok dokumen. Unggah asli ke sistem, bukan tautan Drive. Admission memverifikasi setiap berkas."
      />

      <nav className="grid-4" aria-label="Ringkasan kelompok dokumen">
        {DOCUMENT_GROUPS.map((r) => {
          const { done, total, tone, caption } = summarize(r, HAS_VERTRAG)
          const isGroupLocked = tone === "terkunci"

          return (
            <a key={r.id} href={`#${r.id}`} className={CARD_LINK}>
              <div className="row row-between">
                <span className="label text-muted">{r.name}</span>
                <span className={`text-${tone}`}>
                  <HugeiconsIcon icon={TONE_ICON[tone]} size={18} strokeWidth={1.5} />
                </span>
              </div>
              <span className={`h4 tabular${isGroupLocked ? " text-faint" : ""}`}>
                {isGroupLocked ? (
                  `${total} berkas`
                ) : (
                  <>
                    {done}
                    <span className="body-sm text-muted"> dari {total}</span>
                  </>
                )}
              </span>
              <span className="caption text-muted">{caption}</span>
            </a>
          )
        })}
      </nav>

      {DOCUMENT_GROUPS.map((r) => {
        const locked = isLocked(r, HAS_VERTRAG)

        return (
          <section key={r.id} id={r.id} className="card stack scroll-mt-6">
            <div className="row row-between row-wrap">
              <div className="stack" style={{ gap: 2 }}>
                <h2 className="h5">{r.name}</h2>
                <span className="caption text-muted">{r.note}</span>
              </div>
              {!locked && (
                <span className="caption text-muted">Format PDF · maksimal 5 MB per berkas</span>
              )}
            </div>

            {locked && (
              <Notice tone="neutral">
                Kelompok ini terbuka setelah Anda berstatus Dapat Vertrag. Berkas dari Betrieb
                (Vertrag, Krankenversicherung, IHK, Rahmenplan) diunggah di sini setelah partner
                mengirimkannya.
              </Notice>
            )}

            <DocumentTable group={r} hasVertrag={HAS_VERTRAG} />
          </section>
        )
      })}
    </div>
  )
}
