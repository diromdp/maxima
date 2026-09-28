"use client"

import { Cancel01Icon, Download04Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Skeleton } from "@mantine/core"
import Link from "next/link"
import { useState } from "react"

import { QueryError } from "@/src/components/data/QueryError"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Notice } from "@/src/components/ui/Notice"
import { placementQuery } from "@/src/entities/placement/queries"
import {
  cityStateOf,
  type DepartureDocument,
  type DepartureFile,
  PLACEMENT_STATUS_BADGE,
  type PlacementDetail,
  VISA_STATUS_BADGE,
} from "@/src/entities/placement/schema"
import { openStoredObject } from "@/src/lib/api/download"
import { ApiError } from "@/src/lib/api/errors"
import { useRead } from "@/src/lib/api/use-read"
import { DASH, formatDateLong } from "@/src/lib/format"
import { formatMoney, idr } from "@/src/lib/money"
import { notify } from "@/src/lib/notify"

import { AlumniEditModal, type EditSection } from "./AlumniEditModal"
import { DepartureUploadModal } from "./DepartureUploadModal"

const dateOrDash = (value: string | null) => (value ? formatDateLong(value) : DASH)
const textOrDash = (value: string | null) => value || DASH

const BACK_LINK = (
  <Link href="/staff/visa-placement" className="btn btn-secondary">
    Kembali ke Daftar
  </Link>
)

async function openDocument(document: DepartureDocument) {
  if (!document.objectKey) return
  try {
    await openStoredObject(document.objectKey)
  } catch (error) {
    if (!(error instanceof ApiError)) throw error
    notify.error(error.message)
  }
}

function Panel({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <h2 className="h6">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function Rows({ rows }: { rows: readonly { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="list-rows" style={{ margin: 0 }}>
      {rows.map(({ label, value }) => (
        <div key={label} className="row row-between" style={{ gap: 16, paddingBlock: 10 }}>
          <dt className="body-sm text-muted">{label}</dt>
          <dd className="body-sm" style={{ margin: 0, fontWeight: 600, textAlign: "right" }}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function DetailSkeleton() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="30%" radius="xl" />
        <Skeleton height={16} width="60%" radius="xl" />
      </div>
      <Skeleton height={68} radius="md" aria-hidden />
      <div className="grid-2" aria-hidden>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} height={320} radius="md" />
        ))}
      </div>
    </div>
  )
}

export function AlumniDetail({ nis, canEdit }: { nis: string; canEdit: boolean }) {
  const detail = useRead(placementQuery(nis))

  if (detail.isError) {
    return (
      <div className="stack stack-lg">
        <PageHeader title="Detail Alumni" actions={BACK_LINK} />
        <QueryError message={detail.error.message} onRetry={() => void detail.refetch()} />
      </div>
    )
  }
  if (!detail.data) return <DetailSkeleton />
  return <AlumniDetailBody detail={detail.data} canEdit={canEdit} />
}

function AlumniDetailBody({ detail, canEdit }: { detail: PlacementDetail; canEdit: boolean }) {
  const [section, setSection] = useState<EditSection | null>(null)
  const [uploading, setUploading] = useState<DepartureFile | null>(null)
  const { student, values, checklist } = detail
  const visaLock =
    detail.visaGate?.status === "Belum Terbuka"
      ? `Layanan Pengajuan Visa belum terbuka, kurang ${formatMoney(idr(detail.visaGate.shortfallIdr))}.`
      : null

  const editButton = (target: EditSection, lock: string | null = null) =>
    canEdit ? (
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={lock !== null}
        title={lock ?? undefined}
        onClick={() => setSection(target)}
      >
        Ubah
      </button>
    ) : null

  return (
    <div className="stack stack-lg">
      <PageHeader
        title={[student.anrede, student.name].filter(Boolean).join(" ")}
        badge={
          <span className={`badge ${PLACEMENT_STATUS_BADGE[detail.status]}`}>{detail.status}</span>
        }
        subtitle="Detail visa, penempatan, berkas, dan checklist keberangkatan. Tanggal yang tersimpan di sini adalah versi yang berlaku."
        actions={BACK_LINK}
      />

      <section className="card">
        <dl className="row row-wrap" style={{ gap: 24, margin: 0 }}>
          {[
            { label: "NIS", value: student.nis },
            { label: "No Kontrak", value: detail.contract.contractNumber ?? "Belum terbit" },
            { label: "Cabang", value: detail.branch?.name ?? DASH },
            {
              label: "Program",
              value: `${detail.program?.name ?? DASH} ${detail.contract.cohort}`,
            },
            { label: "Jurusan", value: textOrDash(values.fieldOfStudy) },
          ].map(({ label, value }) => (
            <div key={label} className="stack" style={{ gap: 2 }}>
              <dt className="caption text-muted">{label}</dt>
              <dd className="body-sm tabular" style={{ fontWeight: 600, margin: 0 }}>
                {value}
              </dd>
            </div>
          ))}
          <div className="stack" style={{ gap: 2 }}>
            <dt className="caption text-muted">Status</dt>
            <dd style={{ margin: 0 }}>
              <span className={`badge ${PLACEMENT_STATUS_BADGE[detail.status]}`}>
                {detail.status}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      {detail.pendingProposals > 0 && canEdit && (
        <Notice tone="warning" title="Ada usulan dari siswa">
          {student.name} mengisi {detail.pendingProposals} isian di portalnya yang belum
          diverifikasi. Buka Ubah pada panel terkait; usulannya ditulis di bawah tiap kolom.
        </Notice>
      )}

      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="stack">
          <Panel title="I. Proses Visa (Keputusan Jerman)" action={editButton("visa", visaLock)}>
            {visaLock && canEdit && <span className="caption text-muted">{visaLock}</span>}
            <Rows
              rows={[
                { label: "Tanggal Pengajuan Visa", value: dateOrDash(values.visaAppliedOn) },
                { label: "Tanggal Wawancara Kedutaan", value: dateOrDash(values.visaInterviewOn) },
                { label: "Tanggal Visa Terbit", value: dateOrDash(values.visaIssuedOn) },
                { label: "Jenis Visa", value: textOrDash(values.visaKind) },
                { label: "Masa Berlaku Visa", value: textOrDash(values.visaValidity) },
                {
                  label: "Status",
                  value: (
                    <span className={`badge ${VISA_STATUS_BADGE[detail.visaStatus]}`}>
                      {detail.visaStatus}
                    </span>
                  ),
                },
              ]}
            />
          </Panel>

          <Panel title="II. Data Penempatan (Jerman)" action={editButton("placement")}>
            <Rows
              rows={[
                { label: "Perusahaan / Betrieb", value: textOrDash(values.company) },
                { label: "Sekolah (Berufsschule)", value: textOrDash(values.school) },
                { label: "Jurusan Ausbildung", value: textOrDash(values.fieldOfStudy) },
                { label: "Kota / Bundesland", value: cityStateOf(values) ?? DASH },
                { label: "Tanggal Mulai Kontrak", value: dateOrDash(values.contractStartsOn) },
                { label: "Tanggal Selesai Kontrak", value: dateOrDash(values.contractEndsOn) },
                { label: "Tanggal Keberangkatan", value: dateOrDash(values.departureOn) },
              ]}
            />
            <span className="caption text-muted">
              Mengisi Tanggal Keberangkatan menyalakan status Alumni secara otomatis.
            </span>
          </Panel>
        </div>

        <div className="stack">
          <Panel
            title="III. Berkas Alumni"
            action={
              <Link
                href={`/staff/documents/${encodeURIComponent(student.nis)}`}
                className="btn btn-ghost btn-sm"
              >
                Buka Dokumen
              </Link>
            }
          >
            <span className="caption text-muted">
              Visa, Kontrak Kerja (Vertrag), Krankenversicherung, dan Rahmenplan diunggah di sini
              dan langsung berstatus Lengkap. Berkas lain dibaca dari halaman Dokumen.
            </span>
            <ul className="list-rows" style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {detail.files.map((file) => {
                const stored = file.documents.filter((document) => document.objectKey)
                return (
                  <li
                    key={file.label}
                    className="row row-between row-wrap"
                    style={{ gap: 12, paddingBlock: 8 }}
                  >
                    <span className="body-sm">{file.label}</span>
                    <div className="row row-wrap" style={{ gap: 8, justifyContent: "flex-end" }}>
                      {stored.length === 0 ? (
                        <span className="badge badge-tindakan">Belum ada</span>
                      ) : (
                        stored.map((document) => (
                          <button
                            key={document.code}
                            type="button"
                            className="link row"
                            style={{
                              fontSize: 14,
                              gap: 4,
                              background: "none",
                              border: 0,
                              padding: 0,
                              cursor: "pointer",
                            }}
                            onClick={() => void openDocument(document)}
                          >
                            <HugeiconsIcon icon={Download04Icon} size={14} strokeWidth={1.5} />
                            {document.originalName ?? document.name}
                          </button>
                        ))
                      )}
                      {canEdit && file.isUploadable && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setUploading(file)}
                        >
                          {stored.length > 0 ? "Ganti" : "Unggah"}
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </Panel>

          <Panel
            title="IV. Checklist Mandiri Keberangkatan"
            action={
              <span
                className={`badge tabular ${checklist.checked === checklist.total ? "badge-beres" : "badge-berjalan"}`}
              >
                {checklist.checked}/{checklist.total}
              </span>
            }
          >
            <Notice tone="warning">
              Data ini diisi sendiri oleh siswa melalui Portal Siswa. Di sini hanya dibaca, tidak
              dapat dicentang.
            </Notice>
            {checklist.items.length === 0 ? (
              <span className="body-sm text-muted">
                Belum ada butir checklist aktif di Master Data.
              </span>
            ) : (
              <ul className="list-rows" style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {checklist.items.map((item) => (
                  <li key={item.code} className="row" style={{ gap: 10, paddingBlock: 8 }}>
                    <span className={item.isChecked ? "text-success" : "text-faint"} aria-hidden>
                      <HugeiconsIcon
                        icon={item.isChecked ? Tick02Icon : Cancel01Icon}
                        size={16}
                        strokeWidth={2}
                      />
                    </span>
                    <span className={`body-sm ${item.isChecked ? "" : "text-muted"}`}>
                      {item.name}
                    </span>
                    <span className="sr-only">{item.isChecked ? "sudah" : "belum"}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      {section && (
        <AlumniEditModal
          key={section}
          detail={detail}
          section={section}
          onClose={() => setSection(null)}
        />
      )}
      {uploading && (
        <DepartureUploadModal
          key={uploading.label}
          detail={detail}
          file={uploading}
          onClose={() => setUploading(null)}
        />
      )}
    </div>
  )
}
