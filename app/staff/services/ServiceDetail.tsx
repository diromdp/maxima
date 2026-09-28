"use client"

import { ArrowDown01Icon, ArrowRight01Icon, PrinterIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Skeleton } from "@mantine/core"
import Link from "next/link"
import { Fragment, useState } from "react"

import { QueryError } from "@/src/components/data/QueryError"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Notice } from "@/src/components/ui/Notice"
import { serviceDetailQuery } from "@/src/entities/service/queries"
import {
  type CourseReports,
  type DossierStep,
  type ServiceDetail as Detail,
  type ServiceResult,
  type ServiceRow,
  STATE_BADGE,
} from "@/src/entities/service/schema"
import { openRenderedFile, openStoredObject } from "@/src/lib/api/download"
import { ApiError } from "@/src/lib/api/errors"
import { useRead } from "@/src/lib/api/use-read"
import { DASH, formatDate } from "@/src/lib/format"
import { formatMoney, idr } from "@/src/lib/money"
import { notify } from "@/src/lib/notify"

import { DossierStepModal } from "./DossierStepModal"
import { ProgressLetterModal } from "./ProgressLetterModal"
import { ServiceWorkModal } from "./ServiceWorkModal"

const ON_LEAVE_REASON = "Pengerjaan berhenti sampai siswa kembali dari cuti."
const STEP_COLUMNS = 9

const lockedHintOf = (row: ServiceRow): string =>
  `Terbuka setelah pembayaran mencapai ${formatMoney(idr(row.thresholdIdr))}, kurang ${formatMoney(idr(row.shortfallIdr))}`

async function openResult(result: ServiceResult) {
  if (!result.objectKey) return
  try {
    await openStoredObject(result.objectKey)
  } catch (error) {
    if (!(error instanceof ApiError)) throw error
    notify.error(error.message)
  }
}

async function openReportCard(id: string) {
  try {
    await openRenderedFile(`/report-cards/${encodeURIComponent(id)}/pdf`)
  } catch (error) {
    if (!(error instanceof ApiError)) throw error
    notify.error(error.message)
  }
}

function ReportCardLinks({
  course,
  canOpen,
}: {
  course: CourseReports | undefined
  canOpen: boolean
}) {
  if (!course || course.reportCards.length === 0) return null
  return course.reportCards.map((card) => {
    const label = `Raport ${course.level.name} · ${card.period}`
    return canOpen ? (
      <button
        key={card.id}
        type="button"
        className="link"
        onClick={() => void openReportCard(card.id)}
      >
        {label}
      </button>
    ) : (
      <span key={card.id} className="caption text-muted">
        {label}
      </span>
    )
  })
}

function DetailSkeleton() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="36%" radius="xl" />
        <Skeleton height={16} width="56%" radius="xl" />
      </div>
      <Skeleton height={68} radius="md" aria-hidden />
      <section className="card stack" aria-hidden>
        {Array.from({ length: STEP_COLUMNS }, (_, index) => (
          <Skeleton key={index} height={52} radius="sm" />
        ))}
      </section>
    </div>
  )
}

export function ServiceDetail({
  nis,
  canWork,
  canOpenReports,
}: {
  nis: string
  canWork: boolean
  canOpenReports: boolean
}) {
  const detail = useRead(serviceDetailQuery(nis))

  if (detail.isError) {
    return (
      <div className="stack stack-lg">
        <PageHeader
          title="Detail Layanan"
          actions={
            <Link href="/staff/services" className="btn btn-secondary">
              Kembali ke Papan Layanan
            </Link>
          }
        />
        <QueryError message={detail.error.message} onRetry={() => void detail.refetch()} />
      </div>
    )
  }
  if (!detail.data) return <DetailSkeleton />
  return (
    <ServiceDetailBody detail={detail.data} canWork={canWork} canOpenReports={canOpenReports} />
  )
}

function ServiceDetailBody({
  detail,
  canWork,
  canOpenReports,
}: {
  detail: Detail
  canWork: boolean
  canOpenReports: boolean
}) {
  const [openCode, setOpenCode] = useState<string | null>(null)
  const [editing, setEditing] = useState<ServiceRow | null>(null)
  const [editingStep, setEditingStep] = useState<DossierStep | null>(null)
  const [isPrinting, setIsPrinting] = useState(false)
  const { student } = detail
  const courseOf = (code: string) => detail.courses.find((course) => course.level.code === code)
  const infoCourses = detail.courses.filter(
    (course) => !detail.services.some((row) => row.code === course.level.code),
  )

  const blockOf = (row: ServiceRow): string | null => {
    if (row.status === "Belum Terbuka") return lockedHintOf(row)
    if (student.onLeave) return ON_LEAVE_REASON
    return null
  }

  return (
    <div className="stack stack-lg">
      <PageHeader
        title={`Detail Layanan, ${student.name}`}
        badge={student.onLeave ? <span className="badge badge-berjalan">Cuti</span> : undefined}
        subtitle="Sembilan layanan siswa ini. Status gerbang mengikuti pembayaran; yang diisi di sini progres, PIC, tanggal, catatan, dan hasil."
        actions={
          <div className="row row-wrap" style={{ gap: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsPrinting(true)}>
              <HugeiconsIcon icon={PrinterIcon} size={16} strokeWidth={1.5} />
              Cetak Surat Progres
            </button>
            <Link href="/staff/services" className="btn btn-secondary">
              Kembali ke Papan Layanan
            </Link>
          </div>
        }
      />

      <section className="card">
        <dl className="row row-wrap" style={{ gap: 24, margin: 0 }}>
          {[
            { label: "NIS", value: student.nis },
            { label: "Paket", value: detail.package.name },
            { label: "Cabang", value: detail.branch.name },
            { label: "Total Masuk", value: formatMoney(idr(detail.paidIdr)) },
            {
              label: "Sisa Pembayaran",
              value: formatMoney(idr(detail.remainingIdr)),
              tone: "danger",
            },
          ].map(({ label, value, tone }) => (
            <div key={label} className="stack" style={{ gap: 2 }}>
              <dt className="caption text-muted">{label}</dt>
              <dd
                className={`body-sm tabular${tone ? ` text-${tone}` : ""}`}
                style={{ fontWeight: 600, margin: 0 }}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {student.onLeave && (
        <Notice tone="warning">
          Siswa berstatus Cuti. Gerbang tetap terbuka mengikuti pembayaran, pengerjaan layanan
          berhenti sampai ia kembali.
        </Notice>
      )}

      <section className="card stack">
        {detail.services.length === 0 ? (
          <p className="body-sm text-muted">Paket siswa ini tidak memuat layanan apa pun.</p>
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Layanan</th>
                  <th scope="col">Status</th>
                  <th scope="col">Progres / Aksi yang Perlu</th>
                  <th scope="col">PIC</th>
                  <th scope="col">Tgl Mulai</th>
                  <th scope="col">Tgl Selesai</th>
                  <th scope="col" style={{ minWidth: 140 }}>
                    Catatan
                  </th>
                  <th scope="col">Hasil</th>
                  {canWork && (
                    <th scope="col" style={{ textAlign: "right" }}>
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {infoCourses.map((course) => (
                  <tr key={course.level.id}>
                    <td style={{ fontWeight: 600 }}>{course.level.name}</td>
                    <td>
                      <span className="badge badge-terkunci">Info</span>
                    </td>
                    <td className="wrap">
                      <span className="caption text-muted">
                        Kursus tercakup DP, bukan layanan. Baris ini hanya informasi raport.
                      </span>
                    </td>
                    <td>{DASH}</td>
                    <td>{DASH}</td>
                    <td>{DASH}</td>
                    <td>{DASH}</td>
                    <td>
                      {course.reportCards.length === 0 ? (
                        DASH
                      ) : (
                        <div className="stack" style={{ gap: 2, alignItems: "flex-start" }}>
                          <ReportCardLinks course={course} canOpen={canOpenReports} />
                        </div>
                      )}
                    </td>
                    {canWork && <td />}
                  </tr>
                ))}
                {detail.services.map((row) => {
                  const isOpen = openCode === row.code
                  const block = blockOf(row)
                  return (
                    <Fragment key={row.code}>
                      <tr>
                        <td style={{ fontWeight: 600 }}>
                          {row.steps ? (
                            <button
                              type="button"
                              className="table-sort"
                              aria-expanded={isOpen}
                              onClick={() => setOpenCode(isOpen ? null : row.code)}
                            >
                              <HugeiconsIcon
                                icon={isOpen ? ArrowDown01Icon : ArrowRight01Icon}
                                size={14}
                                strokeWidth={1.5}
                              />
                              {row.name}
                            </button>
                          ) : (
                            row.name
                          )}
                        </td>
                        <td>
                          <span className={`badge ${STATE_BADGE[row.status]}`}>{row.status}</span>
                        </td>
                        <td className="wrap">
                          {row.status === "Belum Terbuka" ? (
                            <span className="caption text-muted">{lockedHintOf(row)}</span>
                          ) : (
                            (row.progressNote ?? DASH)
                          )}
                        </td>
                        <td>{row.pic?.name ?? DASH}</td>
                        <td className="tabular">
                          {row.startedOn ? formatDate(row.startedOn) : DASH}
                        </td>
                        <td className="tabular">
                          {row.finishedOn ? formatDate(row.finishedOn) : DASH}
                        </td>
                        <td className="wrap">{row.note ?? DASH}</td>
                        <td>
                          {row.results.length === 0 &&
                          (courseOf(row.code)?.reportCards.length ?? 0) === 0 ? (
                            DASH
                          ) : (
                            <div className="stack" style={{ gap: 2, alignItems: "flex-start" }}>
                              <ReportCardLinks
                                course={courseOf(row.code)}
                                canOpen={canOpenReports}
                              />
                              {row.results.map((result) => (
                                <button
                                  key={result.documentType}
                                  type="button"
                                  className="link"
                                  onClick={() => void openResult(result)}
                                >
                                  {result.originalName ?? result.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                        {canWork && (
                          <td style={{ textAlign: "right" }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              disabled={block !== null}
                              title={block ?? undefined}
                              onClick={() => setEditing(row)}
                            >
                              Ubah
                            </button>
                          </td>
                        )}
                      </tr>

                      {isOpen && row.steps && (
                        <tr>
                          <td colSpan={canWork ? STEP_COLUMNS : STEP_COLUMNS - 1}>
                            <div className="row row-wrap" style={{ gap: 12 }}>
                              {row.steps.map((step) => (
                                <span key={step.step} className="row" style={{ gap: 6 }}>
                                  <span className={`badge ${STATE_BADGE[step.state]}`}>
                                    {step.state}
                                  </span>
                                  <span className="caption">{step.name}</span>
                                  {canWork && (
                                    <button
                                      type="button"
                                      className="btn btn-ghost btn-sm"
                                      disabled={block !== null}
                                      title={block ?? undefined}
                                      aria-label={`Ubah langkah ${step.name}`}
                                      onClick={() => setEditingStep(step)}
                                    >
                                      Ubah
                                    </button>
                                  )}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="caption text-muted">
          Status gerbang dihitung dari pembayaran dan tidak dapat diubah dari halaman ini. Ubah
          mengisi progres, PIC, tanggal, catatan, dan hasil; gerbang Belum Terbuka tidak bisa
          dikerjakan.
        </p>
      </section>

      {editing && (
        <ServiceWorkModal
          key={editing.code}
          detail={detail}
          row={editing}
          onClose={() => setEditing(null)}
        />
      )}
      {editingStep && (
        <DossierStepModal
          key={editingStep.step}
          detail={detail}
          step={editingStep}
          onClose={() => setEditingStep(null)}
        />
      )}
      {isPrinting && <ProgressLetterModal nis={student.nis} onClose={() => setIsPrinting(false)} />}
    </div>
  )
}
