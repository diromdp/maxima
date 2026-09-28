"use client"

import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"

import { studentAcademicQuery } from "@/src/entities/student/queries"
import type { LevelState, StudentAcademic } from "@/src/entities/student/schema"
import { openPresigned } from "@/src/lib/api/download"
import { ApiError } from "@/src/lib/api/errors"
import { useRead } from "@/src/lib/api/use-read"
import { formatDate } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"

import { EmptyText, FieldValue, Panel, TabBody } from "./Panel"

const DASH = "-"

const LEVEL_TONE: Readonly<Record<LevelState, string>> = {
  Lulus: "badge-beres",
  Berjalan: "badge-berjalan",
  "Sudah diikuti": "badge-terkunci",
  Terkunci: "badge-tindakan",
  "Belum mulai": "badge-terkunci",
}

const levelLabel = (level: StudentAcademic["levels"][number]) =>
  level.state === "Lulus" && level.finalScore !== null
    ? `Lulus, nilai ${level.finalScore}`
    : level.state

async function downloadCertificate(id: string) {
  try {
    await openPresigned(`/certificates/${id}/file`)
  } catch (error) {
    if (error instanceof ApiError) notify.error(error.message)
    else throw error
  }
}

function AcademicView({ academic }: { academic: StudentAcademic }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected =
    academic.levels.find((level) => level.level.id === selectedId) ??
    academic.levels.find((level) => level.state === "Berjalan") ??
    null
  const chapters = selected?.chapters ?? null
  const kkm = chapters?.kkm ?? null

  return (
    <div className="grid-main-aside">
      <div className="stack">
        <Panel title="Kelas Saat Ini">
          {academic.class ? (
            <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(140px,1fr))]">
              <FieldValue label="Kelas" value={academic.class.name} />
              <FieldValue label="Level" value={academic.currentLevel?.name ?? DASH} />
              <FieldValue label="Pengajar" value={academic.class.teacher ?? DASH} />
              <FieldValue label="Jadwal" value={academic.class.schedule} />
            </div>
          ) : (
            <EmptyText>Siswa belum masuk kelas aktif.</EmptyText>
          )}
        </Panel>

        <Panel title="Progres Sertifikat Bahasa">
          <div className="row row-wrap" style={{ gap: 8 }}>
            {academic.levels.map((level, index) => (
              <div key={level.level.id} className="row" style={{ gap: 8 }}>
                {level.chapters ? (
                  <button
                    type="button"
                    className={`badge ${LEVEL_TONE[level.state]}`}
                    aria-pressed={selected?.level.id === level.level.id}
                    aria-label={`Lihat nilai per bab level ${level.level.name}`}
                    onClick={() => setSelectedId(level.level.id)}
                  >
                    <strong>{level.level.name}</strong>
                    {levelLabel(level)}
                  </button>
                ) : (
                  <span className={`badge ${LEVEL_TONE[level.state]}`}>
                    <strong>{level.level.name}</strong>
                    {levelLabel(level)}
                  </span>
                )}
                {index < academic.levels.length - 1 && (
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
          title={`Nilai per Bab${selected ? ` (Level ${selected.level.name})` : ""}`}
          aside={kkm !== null && <span className="label text-danger tabular">KKM {kkm}</span>}
        >
          {!chapters || chapters.rows.length === 0 ? (
            <EmptyText>Belum ada nilai untuk level ini.</EmptyText>
          ) : (
            <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(72px,1fr))]">
              {chapters.rows.map((row) => (
                <div
                  key={row.chapter}
                  className="card-soft stack"
                  style={{ gap: 2, padding: 12, textAlign: "center" }}
                >
                  <span className="caption text-muted">K{row.chapter}</span>
                  <span
                    className={`h5 tabular${row.score !== null && kkm !== null && row.score < kkm ? " text-danger" : ""}`}
                  >
                    {row.score ?? DASH}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="stack">
        <Panel title="Kehadiran">
          {academic.attendance.recorded === 0 ? (
            <EmptyText>Belum ada sesi yang tercatat.</EmptyText>
          ) : (
            <div className="row" style={{ alignItems: "baseline" }}>
              <span className="h2 tabular">{academic.attendance.percent ?? 0}%</span>
              <span className="caption text-muted tabular">
                Hadir {academic.attendance.present} dari {academic.attendance.recorded} sesi
              </span>
            </div>
          )}
        </Panel>

        <Panel title="Raport Akademik">
          {academic.reportCards.length === 0 ? (
            <EmptyText>Belum ada raport yang terbit.</EmptyText>
          ) : (
            <div className="list-rows">
              {academic.reportCards.map((card) => (
                <div key={card.id} className="row row-between">
                  <div className="stack" style={{ gap: 0 }}>
                    <span className="body-sm">
                      Raport Level {card.level} · {card.period}
                    </span>
                    <span className="caption text-muted">
                      {card.sentAt
                        ? `Dikirim ${formatDate(card.sentAt)}`
                        : "Belum dikirim ke siswa"}
                    </span>
                  </div>
                  <a
                    className="btn btn-ghost btn-sm"
                    href={`/api/download/report-cards/${card.id}/pdf`}
                    target="_blank"
                    rel="noopener"
                  >
                    Unduh
                  </a>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Sertifikat Bahasa">
          {academic.certificates.length === 0 ? (
            <EmptyText>Siswa belum punya sertifikat bahasa.</EmptyText>
          ) : (
            <div className="list-rows">
              {academic.certificates.map((certificate) => (
                <div key={certificate.id} className="row row-between">
                  <div className="stack" style={{ gap: 2 }}>
                    <span className="body-sm" style={{ fontWeight: 600 }}>
                      {certificate.kind.name} {certificate.level.name}
                    </span>
                    <span className="caption text-muted">
                      {certificate.verification} · {certificate.status}
                    </span>
                  </div>
                  {certificate.hasFile && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => void downloadCertificate(certificate.id)}
                    >
                      Unduh
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}

export function AcademicTab({ nis }: { nis: string }) {
  const academic = useRead(studentAcademicQuery(nis))
  return <TabBody query={academic}>{(data) => <AcademicView academic={data} />}</TabBody>
}
