"use client"

import { Select } from "@mantine/core"
import { useState } from "react"

import { DataTable } from "@/src/components/data/DataTable"
import { Notice } from "@/src/components/ui/Notice"
import { formatPercent } from "@/src/lib/format"

import { CLASSES, DEFAULT_KKM, LOW_ATTENDANCE } from "../classes/sample"
import {
  AT_RISK,
  branchOptions,
  chapterLabel,
  classOf,
  LAGGING_CHAPTERS,
  levelOptions,
  type MonitoredStudent,
  RISK_BADGE,
  risksOf,
} from "./sample"

const ALL = "Semua"

export function AtRiskTable() {
  const [branch, setBranch] = useState(ALL)
  const [classId, setClassId] = useState(ALL)
  const [level, setLevel] = useState(ALL)

  const rows = AT_RISK.filter((row) => {
    const room = classOf(row.classId)
    if (!room) return false
    return (
      (branch === ALL || room.branch === branch) &&
      (classId === ALL || room.id === classId) &&
      (level === ALL || room.level === level)
    )
  })

  return (
    <div className="stack stack-lg">
      <Notice tone="info" title="Aturan sistem">
        Siswa berstatus Cuti tidak muncul di sini. Seluruhnya dihitung otomatis dari data kelas,
        sesi, dan penilaian: kehadiran di bawah {formatPercent(LOW_ATTENDANCE)}, rata-rata nilai
        atau hasil evaluasi di bawah KKM {DEFAULT_KKM}, atau tertinggal lebih dari{" "}
        {LAGGING_CHAPTERS} bab dari kelasnya.
      </Notice>

      <section className="card stack">
        <div className="row row-between row-wrap" style={{ alignItems: "flex-end" }}>
          <div className="row row-wrap" style={{ gap: 12 }}>
            <Select
              label="Cabang"
              size="sm"
              w={160}
              allowDeselect={false}
              data={[ALL, ...branchOptions()]}
              value={branch}
              onChange={(value) => value && setBranch(value)}
            />
            <Select
              label="Kelas"
              size="sm"
              w={200}
              allowDeselect={false}
              data={[
                { value: ALL, label: ALL },
                ...CLASSES.map((room) => ({ value: room.id, label: room.name })),
              ]}
              value={classId}
              onChange={(value) => value && setClassId(value)}
            />
            <Select
              label="Level"
              size="sm"
              w={150}
              allowDeselect={false}
              data={[ALL, ...levelOptions()]}
              value={level}
              onChange={(value) => value && setLevel(value)}
            />
          </div>
          <span className="caption text-muted">{rows.length} siswa berisiko</span>
        </div>

        <DataTable<MonitoredStudent>
          rows={rows}
          rowKey={(row) => row.nis}
          defaultSort={{ key: "risiko", dir: "desc" }}
          emptyText="Tidak ada siswa berisiko pada saringan ini."
          columns={[
            { key: "nama", header: "Nama Siswa", sort: (row) => row.name, cell: (row) => row.name },
            {
              key: "kelas",
              header: "Kelas",
              sort: (row) => classOf(row.classId)?.name ?? "",
              cell: (row) => classOf(row.classId)?.name,
            },
            {
              key: "level",
              header: "Level",
              sort: (row) => classOf(row.classId)?.level ?? "",
              cell: (row) => classOf(row.classId)?.level,
            },
            {
              key: "kehadiran",
              header: "Kehadiran",
              align: "right",
              sort: (row) => row.attendance,
              cell: (row) => (
                <span className={row.attendance < LOW_ATTENDANCE ? "text-danger" : ""}>
                  {formatPercent(row.attendance)}
                </span>
              ),
            },
            {
              key: "nilai",
              header: "Rata-rata Nilai",
              align: "right",
              sort: (row) => row.averageScore,
              cell: (row) => (
                <span className={row.averageScore < DEFAULT_KKM ? "text-danger" : ""}>
                  {row.averageScore}
                </span>
              ),
            },
            {
              key: "progres",
              header: "Progress Materi",
              sort: (row) => row.chapter,
              cell: (row) => chapterLabel(row.chapter),
            },
            {
              key: "risiko",
              header: "Indikator Risiko",
              sort: (row) => risksOf(row).length,
              cell: (row) => (
                <div className="row" style={{ gap: 6 }}>
                  {risksOf(row).map((risk) => (
                    <span key={risk} className={`badge ${RISK_BADGE[risk]}`}>
                      {risk}
                    </span>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </section>
    </div>
  )
}
