import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { DASH, formatPercent } from "@/src/lib/format"

import { CertificateVerification } from "./CertificateVerification"
import { FieldValue, Panel } from "./Panel"
import {
  ATTENDANCE,
  CHAPTER_SCORES,
  CLASSROOM,
  KKM,
  type Level,
  LEVELS,
  REPORT_CARDS,
} from "./sample"

const LEVEL_TONE: Readonly<Record<Level["status"], string>> = {
  Lulus: "badge-beres",
  Belajar: "badge-berjalan",
  "Belum mulai": "badge-terkunci",
}

const levelLabel = (l: Level) =>
  l.status === "Lulus" && l.score !== null ? `Lulus, nilai ${l.score}` : l.status

export function AcademicTab() {
  const attendance = ATTENDANCE.expected === 0 ? 0 : ATTENDANCE.present / ATTENDANCE.expected

  return (
    <div className="grid-main-aside">
      <div className="stack">
        <Panel title="Kelas Saat Ini">
          <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(140px,1fr))]">
            <FieldValue label="Kelas" value={CLASSROOM.name} />
            <FieldValue label="Level" value={`Level ${CLASSROOM.level}`} />
            <FieldValue label="Pengajar" value={CLASSROOM.teacher} />
            <FieldValue label="Jadwal" value={CLASSROOM.schedule} />
            <FieldValue
              label="Progres Materi"
              value={`Bab ${CLASSROOM.chapter} dari ${CLASSROOM.chaptersTotal}`}
            />
          </div>
        </Panel>

        <Panel title="Progres Level Bahasa">
          <div className="row row-wrap" style={{ gap: 8 }}>
            {LEVELS.map((l, index) => (
              <div key={l.level} className="row" style={{ gap: 8 }}>
                <span className={`badge ${LEVEL_TONE[l.status]}`}>
                  <strong>{l.level}</strong>
                  {levelLabel(l)}
                </span>
                {index < LEVELS.length - 1 && (
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={16}
                    strokeWidth={1.5}
                    className="text-faint"
                    aria-hidden
                  />
                )}
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title={`Nilai per Bab (Level ${CLASSROOM.level})`}
          aside={<span className="label text-danger tabular">KKM {KKM}</span>}
        >
          <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(72px,1fr))]">
            {CHAPTER_SCORES.map((score, index) => (
              <div
                key={index}
                className="card-soft stack"
                style={{ gap: 2, padding: 12, textAlign: "center" }}
              >
                <span className="caption text-muted">Bab {index + 1}</span>
                <span
                  className={`h5 tabular${score !== null && score < KKM ? " text-danger" : ""}`}
                >
                  {score ?? DASH}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="stack">
        <Panel title="Kehadiran">
          <div className="row" style={{ alignItems: "baseline" }}>
            <span className="h2 tabular">{formatPercent(attendance)}</span>
            <span className="caption text-muted tabular">
              Hadir {ATTENDANCE.present} dari {ATTENDANCE.expected} sesi
            </span>
          </div>
        </Panel>

        <Panel title="Raport Akademik">
          <div className="list-rows">
            {REPORT_CARDS.map((r) => (
              <div key={r.level} className="row row-between">
                <span className="body-sm">Raport Level {r.level}</span>
                {r.issued ? (
                  <button type="button" className="btn btn-ghost btn-sm">
                    Unduh
                  </button>
                ) : (
                  <span className="caption text-muted">Belum Terbit</span>
                )}
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Sertifikat Bahasa">
          <p className="caption text-muted">
            Diunggah siswa lewat portal. Nilai berlaku setelah ditandai Terverifikasi di sini.
          </p>
          <CertificateVerification />
        </Panel>
      </div>
    </div>
  )
}
