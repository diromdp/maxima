"use client"

import { useState } from "react"
import { Group, NativeSelect, Title } from "@mantine/core"

import { DataTable } from "@/src/components/data/DataTable"
import { DASH, formatPercent } from "@/src/lib/format"
import { Notice } from "@/src/components/ui/Notice"

import {
  ATTITUDE_GRADE,
  KKM,
  LEVELS,
  REPORTS,
  RUNNING_LEVEL,
  type ChapterStatus,
  type LevelState,
} from "./data"

const CHAPTER_BADGE: Readonly<Record<ChapterStatus, string>> = {
  Tuntas: "badge-beres",
  Remedial: "badge-tindakan",
  Berjalan: "badge-berjalan",
}

const LEVEL_WORD: Readonly<Record<LevelState["kind"], string>> = {
  lulus: "Lulus",
  berjalan: "Berjalan",
  terkunci: "Terkunci",
  belum: "Belum mulai",
}

/**
 * 4.2 + 4.4 — satu rapor per level, dipilih lewat dropdown. Susunannya
 * mengikuti berkas rapor Bandung (Laporan Hasil Belajar Siswa) tanpa kop
 * surat: identitas, nilai per bab, ujian, deskripsi belajar, sepuluh aspek
 * sikap, presensi, catatan pengajar, dua penanda tangan. Level terkunci
 * (abu di kartu atas) mati di dropdown — tidak ada rapornya.
 */
export function ReportCard({ studentName }: { studentName: string }) {
  const [level, setLevel] = useState(RUNNING_LEVEL)
  const report = REPORTS[level]

  const options = LEVELS.map(({ level, state }) => ({
    value: level,
    label: `${level} · ${LEVEL_WORD[state.kind]}`,
    disabled: REPORTS[level] === null,
  }))

  const identity = report
    ? ([
        ["Nama Lengkap", studentName],
        ["Pengajar", report.teacher],
        ["Periode", report.period],
        ["Tempat Belajar", report.place],
      ] as const)
    : []

  return (
    <section className="card stack stack-lg" aria-labelledby="report-heading">
      <Group justify="space-between" align="center" wrap="wrap" gap="md">
        <Title order={5} id="report-heading">
          Laporan Hasil Belajar Siswa
        </Title>

        <Group gap="sm" wrap="nowrap">
          <NativeSelect
            aria-label="Pilih level rapor"
            radius="xl"
            value={level}
            onChange={(e) => setLevel(e.currentTarget.value)}
            data={options}
          />
          {report && (
            <a className="btn btn-success" href={report.downloadHref} download>
              Unduh Rapor
            </a>
          )}
        </Group>
      </Group>

      {!report ? (
        <Notice tone="neutral">
          Level {level} belum dibuka. Rapornya terbit setelah level ini berjalan.
        </Notice>
      ) : (
        <>
          <dl className="grid-4" style={{ margin: 0 }}>
            {identity.map(([name, value]) => (
              <div key={name} className="stack" style={{ gap: 2 }}>
                <dt className="spec-name">{name}</dt>
                <dd className="body-sm" style={{ margin: 0 }}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Nilai per bab: milik Pengajar, layar ini membaca. */}
          <div className="stack stack-sm">
            <Group justify="space-between" align="baseline" wrap="nowrap">
              <span className="h6">Nilai per Bab</span>
              <span className="badge badge-terkunci" style={{ fontSize: 14, padding: "4px 12px" }}>
                KKM {KKM}
              </span>
            </Group>
            <DataTable
              rows={report.chapters}
              rowKey={(r) => r.chapter}
              filter={{ value: (r) => r.status, options: ["Tuntas", "Remedial", "Berjalan"] }}
              emptyText="Belum ada nilai tercatat untuk level ini."
              columns={[
                { key: "bab", header: "Bab", cell: (r) => r.chapter },
                { key: "materi", header: "Materi", wrap: true, cell: (r) => r.material },
                {
                  key: "nilai",
                  header: "Nilai",
                  align: "right",
                  sort: (r) => r.score ?? -1,
                  cell: (r) => r.score ?? DASH,
                },
                {
                  key: "status",
                  header: "Status",
                  sort: (r) => r.status,
                  cell: (r) => (
                    <span className={`badge ${CHAPTER_BADGE[r.status]}`}>{r.status}</span>
                  ),
                },
              ]}
            />
          </div>

          <div className="grid-2" style={{ columnGap: 48 }}>
            {/* Ujian: nilai terhadap KKM. Kosong berarti belum diujikan. */}
            <div className="stack stack-sm">
              <span className="h6">Ujian</span>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Ujian</th>
                    <th scope="col" className="numeric">
                      Nilai
                    </th>
                    <th scope="col" className="numeric">
                      KKM
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.exams.map((e) => (
                    <tr key={e.exam}>
                      <td>{e.exam}</td>
                      <td
                        className={`numeric tabular${e.score !== null && e.score < KKM ? " text-danger" : ""}`}
                      >
                        {e.score ?? DASH}
                      </td>
                      <td className="numeric tabular text-muted">{KKM}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sepuluh aspek sikap, dua kolom seperti di berkas aslinya. */}
            <div className="stack stack-sm">
              <span className="h6">Perkembangan Sikap dan Karakter</span>
              <div className="grid-2" style={{ rowGap: 0, columnGap: 32 }}>
                {report.attitudes.map((a) => {
                  const g = ATTITUDE_GRADE[a.grade]
                  return (
                    <div key={a.aspect} className="row row-between" style={{ paddingBlock: 10 }}>
                      <span className="body-sm">{a.aspect}</span>
                      <span className={`badge badge-${g.tone}`}>{g.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="grid-main-aside">
            <div className="stack stack-lg">
              <div className="stack stack-sm">
                <span className="h6">Deskripsi Belajar Siswa</span>
                <p className="body-sm">{report.description}</p>
              </div>
              <div className="stack stack-sm">
                <span className="h6">Catatan dari Pengajar</span>
                <p className="body-sm">{report.teacherNote}</p>
              </div>
            </div>

            <div className="stack stack-lg">
              <div className="stack" style={{ gap: 2 }}>
                <span className="h6">Presensi</span>
                <span className="h4 tabular text-beres">
                  {formatPercent(report.attendanceRate)}
                </span>
                <span className="caption text-muted">kehadiran periode {report.period}</span>
              </div>

              <div className="stack stack-sm">
                {report.signatures.map((s) => (
                  <div key={s.role} className="stack" style={{ gap: 2 }}>
                    <span className="spec-name">{s.role}</span>
                    <span className="body-sm">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
