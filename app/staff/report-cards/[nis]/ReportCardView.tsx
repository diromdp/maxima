"use client"

import { Skeleton } from "@mantine/core"
import Link from "next/link"

import { QueryError } from "@/src/components/data/QueryError"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Notice } from "@/src/components/ui/Notice"
import { reportCardQuery } from "@/src/entities/report-card/queries"
import {
  ATTITUDE_GRADE_LABEL,
  formatDecimal,
  type AttitudeGrade,
  type ExamStatus,
  type Recommendation,
  type ReportCardDetail,
  type ScoreLine,
} from "@/src/entities/report-card/schema"
import { useRead } from "@/src/lib/api/use-read"
import { formatDate, formatDateTime } from "@/src/lib/format"

import { ReportActions } from "./ReportActions"

const ATTITUDE_TONE: Readonly<Record<AttitudeGrade, string>> = {
  BS: "badge-success",
  B: "badge-info",
  C: "badge-warning",
  PB: "badge-danger",
}

const RECOMMENDATION_TONE: Readonly<Record<Recommendation, string>> = {
  "Naik Level": "badge-success",
  "Perlu Remedial": "badge-warning",
  "Tidak Naik": "badge-danger",
}

const LEARNING_TONE: Readonly<Record<ExamStatus, string>> = {
  Lulus: "badge-success",
  "Tidak Lulus": "badge-danger",
  "Belum Lengkap": "badge-terkunci",
}

const isBelow = (score: number | null, kkm: number | null) =>
  score !== null && kkm !== null && score < kkm

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card stack">
      <h2 className="h6">{title}</h2>
      {children}
    </section>
  )
}

function ScoreTable({
  head,
  rows,
  average,
}: {
  head: string
  rows: readonly ScoreLine[]
  average?: number | null
}) {
  const kkm = rows[0]?.kkm ?? null
  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>{head}</th>
            <th className="numeric">Nilai</th>
            <th className="numeric">KKM</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>{row.label}</td>
              <td className={`numeric tabular${isBelow(row.score, row.kkm) ? " text-danger" : ""}`}>
                {formatDecimal(row.score)}
              </td>
              <td className="numeric tabular text-muted">{formatDecimal(row.kkm)}</td>
            </tr>
          ))}
          {average !== undefined && (
            <tr>
              <td style={{ fontWeight: 600 }}>Rata-rata</td>
              <td
                className={`numeric tabular${isBelow(average, kkm) ? " text-danger" : ""}`}
                style={{ fontWeight: 600 }}
              >
                {formatDecimal(average)}
              </td>
              <td className="numeric tabular text-muted">{formatDecimal(kkm)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="row row-between" style={{ gap: 12 }}>
      <span className="body-sm text-muted">{label}</span>
      <span className="body-sm" style={{ fontWeight: 600, textAlign: "right" }}>
        {value}
      </span>
    </div>
  )
}

function LevelSwitch({ report }: { report: ReportCardDetail }) {
  const nis = encodeURIComponent(report.header.nis)
  return (
    <div className="row row-wrap" style={{ gap: 8 }}>
      {report.levels.map((level) =>
        level.isAvailable ? (
          <Link
            key={level.id}
            className={`btn btn-sm ${level.id === report.header.level.id ? "btn-primary" : "btn-secondary"}`}
            href={`/staff/report-cards/${nis}?level=${level.id}`}
            aria-current={level.id === report.header.level.id ? "page" : undefined}
          >
            {level.name}
          </Link>
        ) : (
          <button
            key={level.id}
            type="button"
            className="btn btn-secondary btn-sm"
            disabled
            title={`Siswa ini belum punya kelas, nilai, atau raport level ${level.name}.`}
          >
            {level.name}
          </button>
        ),
      )}
    </div>
  )
}

function finalRecommendationText(report: ReportCardDetail) {
  const { finalRecommendation, nextLevel } = report.content
  if (finalRecommendation === "Naik Level" && nextLevel) {
    return `Naik Level ${report.header.level.name} ke ${nextLevel}`
  }
  return finalRecommendation ?? "Belum ditetapkan di halaman Penilaian"
}

function StatusPanel({ report }: { report: ReportCardDetail }) {
  const { content } = report
  return (
    <Panel title="Status & Rekomendasi">
      <div className="stack stack-sm">
        <Row
          label="Status Belajar"
          value={
            content.learningStatus ? (
              <span className={`badge ${LEARNING_TONE[content.learningStatus]}`}>
                {content.learningStatus}
              </span>
            ) : (
              "-"
            )
          }
        />
        <Row
          label="Status Bab"
          value={`${content.chaptersAboveKkm} dari ${content.chapters.length} bab di atas KKM`}
        />
        <Row
          label="Rekomendasi Ujian"
          value={
            content.examRecommendation ? (
              <span
                className={`badge ${content.examRecommendation === "Direkomendasikan" ? "badge-success" : "badge-warning"}`}
              >
                {content.examRecommendation}
              </span>
            ) : (
              "-"
            )
          }
        />
        <Row
          label="Rekomendasi Akhir"
          value={
            content.finalRecommendation ? (
              <span className={`badge ${RECOMMENDATION_TONE[content.finalRecommendation]}`}>
                {finalRecommendationText(report)}
              </span>
            ) : (
              <span className="text-muted">{finalRecommendationText(report)}</span>
            )
          }
        />
      </div>
    </Panel>
  )
}

function IssueNotice({ report }: { report: ReportCardDetail }) {
  if (report.issued) {
    return (
      <Notice tone="info" className="no-print">
        Raport terbit {formatDateTime(report.issued.issuedAt)}. Isinya tidak berubah walau nilai,
        sikap, atau KKM diubah sesudahnya.
        {report.issued.sentAt
          ? ` Dikirim ke siswa ${formatDateTime(report.issued.sentAt)}.`
          : " Belum dikirim ke siswa."}
      </Notice>
    )
  }
  const readiness = report.readiness
  return (
    <Notice tone="warning" title="Pratinjau, belum terbit" className="no-print">
      Isi di bawah dihitung dari data terbaru dan masih dapat berubah.
      {readiness &&
        ` Absensi ${Math.floor(readiness.attendancePercent)}% dan nilai ${Math.floor(readiness.scoresPercent)}% terisi; ${readiness.isReady ? "raport siap diterbitkan dari antrian penerbitan." : "keduanya harus 100% sebelum raport dapat terbit."}`}
    </Notice>
  )
}

export function ReportCardView({
  nis,
  level,
  period,
  canEdit,
}: {
  nis: string
  level?: string
  period?: string
  canEdit: boolean
}) {
  const report = useRead(reportCardQuery(nis, { level, period }))

  if (report.isError) {
    return (
      <div className="stack stack-lg">
        <PageHeader
          title="Raport"
          breadcrumbs={[{ label: "Raport", href: "/staff/report-cards" }, { label: nis }]}
        />
        <QueryError message={report.error.message} onRetry={() => void report.refetch()} />
      </div>
    )
  }
  if (report.isPending) return <ReportCardSkeleton />

  const { header, content } = report.data
  const subtitle = [
    `NIS ${header.nis}`,
    header.program && `Program ${header.program}`,
    header.className,
    header.branch && `Cabang ${header.branch}`,
    `Periode akademik ${header.period.name} (${formatDate(header.period.startDate)} - ${formatDate(header.period.endDate)})`,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title={header.name}
        badge={<span className="badge badge-info">Level {header.level.name}</span>}
        subtitle={subtitle}
      />

      <div className="row row-between row-wrap no-print" style={{ gap: 12 }}>
        <LevelSwitch report={report.data} />
        <div className="row row-wrap" style={{ gap: 8 }}>
          <ReportActions report={report.data} canEdit={canEdit} />
        </div>
      </div>

      <IssueNotice report={report.data} />

      <div className="grid-main-aside">
        <div className="stack stack-lg">
          <Panel title="Evaluasi Bab (Kapitel)">
            <ScoreTable head="Bab" rows={content.chapters} average={content.chapterAverage} />
          </Panel>

          <Panel title="Ujian">
            <ScoreTable head="Ujian" rows={content.exams} average={content.examAverage} />
            {content.simulations.length > 0 && (
              <ScoreTable head="Simulasi" rows={content.simulations} />
            )}
          </Panel>

          <Panel title="Deskripsi Belajar Siswa Selama Pembelajaran">
            <p className="body-sm">
              {content.learningDescription || (
                <span className="text-muted">Belum diisi pengajar di halaman Penilaian.</span>
              )}
            </p>
          </Panel>
        </div>

        <div className="stack stack-lg">
          <Panel title="Presensi">
            <div className="stack stack-sm">
              <span className="h4 tabular">
                {content.attendance.percent === null
                  ? "-"
                  : `${content.attendance.percent.toLocaleString("id-ID", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}%`}
              </span>
              <span className="caption text-muted">
                Hadir {content.attendance.present} dari {content.attendance.recorded} sesi tercatat
              </span>
            </div>
          </Panel>

          <Panel title="Perkembangan Sikap dan Karakter">
            <div className="stack stack-sm">
              {content.attitudes.map(({ aspect, label, grade }) => (
                <Row
                  key={aspect}
                  label={label}
                  value={
                    grade ? (
                      <span className={`badge ${ATTITUDE_TONE[grade]}`}>{grade}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )
                  }
                />
              ))}
            </div>
            <span className="caption text-muted">
              {Object.entries(ATTITUDE_GRADE_LABEL)
                .map(([grade, label]) => `${grade} = ${label}`)
                .join(" · ")}
            </span>
          </Panel>

          <StatusPanel report={report.data} />

          <Panel title={`Catatan dari Pengajar (${content.teacherName ?? "belum ada pengajar"})`}>
            <p className="body-sm">
              {content.teacherNote || (
                <span className="text-muted">Belum ada catatan pengajar.</span>
              )}
            </p>
          </Panel>
        </div>
      </div>
    </div>
  )
}

export function ReportCardSkeleton() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={16} width="30%" radius="xl" />
        <Skeleton height={32} width="25%" radius="xl" />
        <Skeleton height={16} width="40%" radius="xl" />
      </div>

      <Skeleton height={36} width={240} radius="xl" aria-hidden />

      <div className="grid-main-aside" aria-hidden>
        <Skeleton height={520} radius="md" />
        <div className="stack">
          <Skeleton height={200} radius="md" />
          <Skeleton height={200} radius="md" />
        </div>
      </div>
    </div>
  )
}
