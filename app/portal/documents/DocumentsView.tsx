"use client"

import { CheckmarkCircle02Icon, Clock01Icon, Upload04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Skeleton } from "@mantine/core"

import { QueryError } from "@/src/components/data/QueryError"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Notice } from "@/src/components/ui/Notice"
import { ownDocumentsQuery } from "@/src/entities/document/queries"
import type { DocumentDetail, DocumentGroup } from "@/src/entities/document/schema"
import { useRead } from "@/src/lib/api/use-read"

import { DocumentTable, isUploadedByStudent } from "./DocumentTable"

type Group = DocumentDetail["groups"][number]
type Tone = "beres" | "berjalan" | "tindakan"

const GROUP_NOTE: Readonly<Record<DocumentGroup, string>> = {
  Pribadi: "Wajib saat pendaftaran",
  "Hasil Layanan": "Diproses Maxima, Anda tinggal mengunduh",
  Bewerbung: "Dibutuhkan sebelum pengajuan ke partner",
  "Dari Betrieb": "Diunggah Admission, Anda tinggal mengunduh",
}

const GROUP_ANCHOR: Readonly<Record<DocumentGroup, string>> = {
  Pribadi: "pribadi",
  "Hasil Layanan": "hasil-layanan",
  Bewerbung: "bewerbung",
  "Dari Betrieb": "dari-betrieb",
}

const TONE_ICON: Readonly<Record<Tone, typeof Upload04Icon>> = {
  beres: CheckmarkCircle02Icon,
  berjalan: Clock01Icon,
  tindakan: Upload04Icon,
}

const CARD_LINK =
  "card stack stack-sm text-inherit no-underline transition-colors hover:border-hairline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"

const GROUP_SLOTS = 4

function summaryOf(group: Group): { tone: Tone; caption: string } {
  if (group.total > 0 && group.complete === group.total) {
    return { tone: "beres", caption: "Semua berkas sudah beres" }
  }
  const studentItems = group.items.filter(isUploadedByStudent)
  if (studentItems.length === 0) {
    return {
      tone: "berjalan",
      caption: `${group.total - group.complete} berkas masih disiapkan Maxima`,
    }
  }
  const missing = studentItems.filter(
    (item) => !item.isOptional && (item.state === "Belum Diunggah" || item.state === "Ditolak"),
  ).length
  if (missing > 0) return { tone: "tindakan", caption: `${missing} berkas perlu Anda unggah` }
  return { tone: "berjalan", caption: `${group.pending} berkas menunggu verifikasi` }
}

export function DocumentsSkeleton() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="40%" radius="xl" />
        <Skeleton height={16} width="70%" radius="xl" />
      </div>
      <div className="grid-4" aria-hidden>
        {Array.from({ length: GROUP_SLOTS }, (_, index) => (
          <Skeleton key={index} height={112} radius="md" />
        ))}
      </div>
      {Array.from({ length: GROUP_SLOTS }, (_, index) => (
        <div key={index} className="card stack stack-sm" aria-hidden>
          <Skeleton height={20} width="30%" radius="xl" />
          <Skeleton height={36} radius="sm" />
          <Skeleton height={36} radius="sm" />
        </div>
      ))}
    </div>
  )
}

export function DocumentsView({ isOnLeave }: { isOnLeave: boolean }) {
  const documents = useRead(ownDocumentsQuery())

  if (documents.isError) {
    return <QueryError message={documents.error.message} onRetry={() => void documents.refetch()} />
  }
  if (documents.isPending) return <DocumentsSkeleton />

  const { groups } = documents.data

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Dokumen Saya"
        subtitle="Empat kelompok dokumen. Unggah asli ke sistem, bukan tautan Drive. Admission memverifikasi setiap berkas."
      />

      {isOnLeave && (
        <Notice tone="warning">
          Selama cuti, berkas tetap dapat dilihat dan diunduh, tetapi unggahan dibuka lagi setelah
          masa cuti Anda selesai.
        </Notice>
      )}

      <nav className="grid-4" aria-label="Ringkasan kelompok dokumen">
        {groups.map((group) => {
          const { tone, caption } = summaryOf(group)
          return (
            <a key={group.group} href={`#${GROUP_ANCHOR[group.group]}`} className={CARD_LINK}>
              <div className="row row-between">
                <span className="label text-muted">{group.group}</span>
                <span className={`text-${tone}`}>
                  <HugeiconsIcon icon={TONE_ICON[tone]} size={18} strokeWidth={1.5} />
                </span>
              </div>
              <span className="h4 tabular">
                {group.complete}
                <span className="body-sm text-muted"> dari {group.total}</span>
              </span>
              <span className="caption text-muted">{caption}</span>
            </a>
          )
        })}
      </nav>

      {groups.map((group) => {
        const isUploadGroup = group.items.some(isUploadedByStudent)
        return (
          <section
            key={group.group}
            id={GROUP_ANCHOR[group.group]}
            className="card stack scroll-mt-6"
          >
            <div className="row row-between row-wrap">
              <div className="stack" style={{ gap: 2 }}>
                <h2 className="h5">{group.group}</h2>
                <span className="caption text-muted">{GROUP_NOTE[group.group]}</span>
              </div>
              {isUploadGroup && (
                <span className="caption text-muted">
                  PDF, JPG, atau PNG · maksimal 5 MB per berkas
                </span>
              )}
            </div>

            <DocumentTable items={group.items} isOnLeave={isOnLeave} />
          </section>
        )
      })}
    </div>
  )
}
