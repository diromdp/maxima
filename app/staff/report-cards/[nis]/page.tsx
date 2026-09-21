import Link from "next/link"
import { notFound } from "next/navigation"

import { PageHeader } from "@/src/components/layout/PageHeader"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"

import {
  ATTITUDE_GRADE_LABEL,
  ATTITUDE_GRADES,
  formatScore,
  KKM,
  type Level,
} from "../../assessments/sample"
import {
  ATTITUDE_TONE,
  chaptersAboveKkm,
  fileName,
  finalRecommendation,
  formatAttendance,
  isPassing,
  LEVELS,
  levelsOf,
  PERIOD,
  PROGRAM,
  RECOMMENDATION_TONE,
  type ReportCard,
  reportOf,
  type ScoredItem,
} from "../sample"
import { ReportActions } from "./ReportActions"

import "./print.css"

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
  rows: readonly ScoredItem[]
  average?: number | null
}) {
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
            <tr key={row.label}>
              <td>{row.label}</td>
              <td
                className={`numeric tabular${row.score !== null && row.score < KKM ? " text-danger" : ""}`}
              >
                {formatScore(row.score)}
              </td>
              <td className="numeric tabular text-muted">{KKM}</td>
            </tr>
          ))}
          {average !== undefined && (
            <tr>
              <td style={{ fontWeight: 600 }}>Rata-rata</td>
              <td
                className={`numeric tabular${average !== null && average < KKM ? " text-danger" : ""}`}
                style={{ fontWeight: 600 }}
              >
                {formatScore(average)}
              </td>
              <td className="numeric tabular text-muted">{KKM}</td>
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

function LevelSwitch({
  nis,
  active,
  available,
}: {
  nis: string
  active: Level
  available: readonly Level[]
}) {
  return (
    <div className="row row-wrap" style={{ gap: 8 }}>
      {LEVELS.map((level) =>
        available.includes(level) ? (
          <Link
            key={level}
            className={`btn btn-sm ${level === active ? "btn-primary" : "btn-secondary"}`}
            href={`/staff/report-cards/${nis}?level=${level}`}
            aria-current={level === active ? "page" : undefined}
          >
            {level}
          </Link>
        ) : (
          <button
            key={level}
            type="button"
            className="btn btn-secondary btn-sm"
            disabled
            title={`Belum ada raport level ${level}.`}
          >
            {level}
          </button>
        ),
      )}
    </div>
  )
}

function StatusPanel({ report }: { report: ReportCard }) {
  const passing = isPassing(report)
  const decision = report.note.recommendation

  return (
    <Panel title="Status & Rekomendasi">
      <div className="stack stack-sm">
        <Row
          label="Status Belajar"
          value={
            <span className={`badge ${passing ? "badge-success" : "badge-danger"}`}>
              {passing ? "Lulus" : "Tidak Lulus"}
            </span>
          }
        />
        <Row
          label="Status Bab"
          value={`${chaptersAboveKkm(report)} dari ${report.chapters.length} bab di atas KKM`}
        />
        <Row
          label="Rekomendasi Ujian"
          value={
            <span className={`badge ${passing ? "badge-success" : "badge-warning"}`}>
              {passing ? "Direkomendasikan" : "Remedial dulu"}
            </span>
          }
        />
        <Row
          label="Rekomendasi Akhir"
          value={
            decision ? (
              <span className={`badge ${RECOMMENDATION_TONE[decision]}`}>
                {finalRecommendation(report)}
              </span>
            ) : (
              <span className="text-muted">{finalRecommendation(report)}</span>
            )
          }
        />
      </div>
    </Panel>
  )
}

export default async function ReportCardDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ nis: string }>
  searchParams: Promise<{ level?: string }>
}) {
  const session = await requirePermission("report-cards")
  const { nis } = await params
  const { level: requested } = await searchParams

  const available = levelsOf(nis)
  const level = LEVELS.find((candidate) => candidate === requested) ?? available[0]
  const report = level ? reportOf(nis, level) : null
  if (!report) notFound()

  return (
    <div className="stack stack-lg">
      <PageHeader
        title={report.name}
        badge={<span className="badge badge-info">Level {report.level}</span>}
        subtitle={`NIS ${report.nis} · Program ${PROGRAM} · ${report.className} · Cabang ${report.branch} · Periode akademik ${PERIOD.label} (${PERIOD.range})`}
      />

      <div className="row row-between row-wrap no-print" style={{ gap: 12 }}>
        <LevelSwitch nis={report.nis} active={report.level} available={available} />
        <div className="row row-wrap" style={{ gap: 8 }}>
          <ReportActions
            fileName={fileName(report)}
            readOnly={!canEdit(session.role, "report-cards")}
            studentName={report.name}
          />
        </div>
      </div>

      <div className="grid-main-aside">
        <div className="stack stack-lg">
          <Panel title="Evaluasi Bab (Kapitel)">
            <ScoreTable head="Bab" rows={report.chapters} average={report.chapterAverage} />
          </Panel>

          <Panel title="Ujian">
            <ScoreTable head="Ujian" rows={report.exams} average={report.examAverage} />
            {report.simulations.length > 0 && (
              <ScoreTable head="Simulasi" rows={report.simulations} />
            )}
          </Panel>

          <Panel title="Deskripsi Belajar Siswa Selama Pembelajaran">
            <p className="body-sm">
              {report.note.description || (
                <span className="text-muted">Belum diisi pengajar di halaman Penilaian.</span>
              )}
            </p>
          </Panel>
        </div>

        <div className="stack stack-lg">
          <Panel title="Presensi">
            <div className="stack stack-sm">
              <span className="h4 tabular">{formatAttendance(report.attendanceRate)}</span>
              <span className="caption text-muted">
                Hadir {report.present} dari {report.recorded} sesi tercatat
              </span>
            </div>
          </Panel>

          <Panel title="Perkembangan Sikap dan Karakter">
            <div className="stack stack-sm">
              {report.attitude.map(({ label, grade }) => (
                <Row
                  key={label}
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
              {ATTITUDE_GRADES.map((grade) => `${grade} = ${ATTITUDE_GRADE_LABEL[grade]}`).join(
                " · ",
              )}
            </span>
          </Panel>

          <StatusPanel report={report} />

          <Panel title={`Catatan dari Pengajar (${report.teacher})`}>
            <p className="body-sm">
              {report.note.text || <span className="text-muted">Belum ada catatan pengajar.</span>}
            </p>
          </Panel>
        </div>
      </div>
    </div>
  )
}
