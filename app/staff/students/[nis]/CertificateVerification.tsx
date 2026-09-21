"use client"

import { File01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Select } from "@mantine/core"
import { notify } from "@/src/lib/notify"
import { useState } from "react"

import { formatDate } from "@/src/lib/format"

import {
  deriveStatus,
  MODUL,
  SERTIFIKAT,
  type Sertifikat,
  type Verifikasi,
} from "../../../portal/language-certificates/certificates"

const VERIFICATION_OPTIONS: readonly Verifikasi[] = ["Terverifikasi", "Menunggu", "Tidak lulus"]

const BADGE: Readonly<Record<Verifikasi | "Expired", string>> = {
  Terverifikasi: "badge-beres",
  Menunggu: "badge-berjalan",
  "Tidak lulus": "badge-tindakan",
  Expired: "badge-terkunci",
}

const earliestExpiry = (c: Sertifikat) =>
  Object.values(c.modul)
    .map((m) => m.expired)
    .sort()[0]!

const scoreSummary = (c: Sertifikat) =>
  MODUL.map(({ key, label }) => `${label} ${c.modul[key].nilai ?? "-"}`).join(" · ")

export function CertificateVerification() {
  const [verification, setVerification] = useState<Readonly<Record<string, Verifikasi>>>(() =>
    Object.fromEntries(SERTIFIKAT.map((c) => [c.id, c.verifikasi])),
  )

  if (SERTIFIKAT.length === 0) {
    return <p className="body-sm text-muted">Siswa belum mengunggah sertifikat.</p>
  }

  return (
    <div className="list-rows">
      {[...SERTIFIKAT]
        .sort((a, b) => b.level.localeCompare(a.level))
        .map((c) => {
          const status = verification[c.id] ?? c.verifikasi
          const isExpired = deriveStatus({ ...c, verifikasi: status }) === "Expired"

          return (
            <div key={c.id} className="stack stack-sm">
              <div className="stack" style={{ gap: 2, minWidth: 0 }}>
                <div className="row" style={{ gap: 8 }}>
                  <span className="body-sm" style={{ fontWeight: 600 }}>
                    {c.jenis} {c.level}
                  </span>
                  <span className={`badge ${BADGE[isExpired ? "Expired" : status]}`}>
                    {isExpired ? "Expired" : status}
                  </span>
                </div>
                <span className="caption text-muted tabular">{scoreSummary(c)}</span>
                <span className="caption text-muted">
                  Berlaku sampai {formatDate(earliestExpiry(c))}
                </span>
              </div>

              <div className="row row-between row-wrap" style={{ gap: 8 }}>
                <a
                  className="row caption"
                  style={{ gap: 4 }}
                  href={`/files/${c.berkas}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <HugeiconsIcon icon={File01Icon} size={14} strokeWidth={1.5} />
                  {c.berkas}
                </a>
                <Select
                  aria-label={`Status ${c.jenis} ${c.level}`}
                  size="sm"
                  w={160}
                  data={[...VERIFICATION_OPTIONS]}
                  value={status}
                  allowDeselect={false}
                  onChange={(value) => {
                    if (!value) return
                    setVerification((current) => ({ ...current, [c.id]: value as Verifikasi }))
                    notify.success(
                      `${c.jenis} ${c.level} ditandai ${value}. Tercatat di Log Aktivitas.`,
                    )
                  }}
                />
              </div>
            </div>
          )
        })}
    </div>
  )
}
