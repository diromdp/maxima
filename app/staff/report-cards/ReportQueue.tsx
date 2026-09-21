"use client"

import { Select } from "@mantine/core"
import Link from "next/link"
import { useState } from "react"

import { DataTable } from "@/src/components/data/DataTable"
import { Notice } from "@/src/components/ui/Notice"
import { formatPercent } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"

import { isReady, LEVELS, PERIOD, QUEUE, type QueueRow } from "./sample"

const ALL = "Semua"

const uniqueBranches = Array.from(new Set(QUEUE.map((row) => row.branch)))

function Progress({ ratio }: { ratio: number }) {
  const tone = ratio >= 1 ? "success" : ratio < 0.75 ? "danger" : "warning"
  return (
    <div className="row" style={{ minWidth: 110 }}>
      <div className={`progress progress-${tone}`} style={{ flex: 1 }}>
        <div className="progress-fill" style={{ width: formatPercent(ratio) }} />
      </div>
      <span className={`caption tabular text-${tone}`}>{formatPercent(ratio)}</span>
    </div>
  )
}

export function ReportQueue({ readOnly }: { readOnly: boolean }) {
  const [branch, setBranch] = useState(ALL)
  const [level, setLevel] = useState(ALL)

  const rows = QUEUE.filter(
    (row) => (branch === ALL || row.branch === branch) && (level === ALL || row.level === level),
  )
  const readyCount = rows.filter(isReady).length

  return (
    <div className="stack stack-lg">
      <Notice tone="warning" title="Perhatian">
        Raport tidak dapat terbit bila absensi periode itu belum lengkap (100% terisi).
      </Notice>

      <section className="card stack">
        <div className="row row-between row-wrap" style={{ alignItems: "flex-end" }}>
          <div className="row row-wrap" style={{ gap: 12 }}>
            <Select
              label="Cabang"
              size="sm"
              w={160}
              allowDeselect={false}
              data={[ALL, ...uniqueBranches]}
              value={branch}
              onChange={(value) => value && setBranch(value)}
            />
            <Select
              label="Level"
              size="sm"
              w={120}
              allowDeselect={false}
              data={[ALL, ...LEVELS]}
              value={level}
              onChange={(value) => value && setLevel(value)}
            />
            <Select
              label="Periode"
              size="sm"
              w={160}
              allowDeselect={false}
              data={[PERIOD.label]}
              value={PERIOD.label}
              readOnly
            />
          </div>
          <span className="caption text-muted">
            {readyCount} dari {rows.length} siswa siap terbit
          </span>
        </div>

        <DataTable<QueueRow>
          rows={rows}
          rowKey={(row) => `${row.nis}-${row.level}`}
          defaultSort={{ key: "nama", dir: "asc" }}
          stickyLast
          filter={{
            value: (row) => (isReady(row) ? "Siap Terbit" : "Belum Lengkap"),
            options: ["Siap Terbit", "Belum Lengkap"],
          }}
          columns={[
            {
              key: "nama",
              header: "Nama Siswa",
              sort: (row) => row.name,
              cell: (row) => (
                <Link className="link" href={`/staff/report-cards/${row.nis}?level=${row.level}`}>
                  {row.name}
                </Link>
              ),
            },
            {
              key: "kelas",
              header: "Kelas",
              sort: (row) => row.className,
              cell: (row) => row.className,
            },
            { key: "level", header: "Level", sort: (row) => row.level, cell: (row) => row.level },
            { key: "periode", header: "Periode", cell: (row) => row.period },
            {
              key: "absensi",
              header: "Absensi",
              sort: (row) => row.attendanceFilled,
              cell: (row) => <Progress ratio={row.attendanceFilled} />,
            },
            {
              key: "nilai",
              header: "Nilai",
              sort: (row) => row.scoresFilled,
              cell: (row) => <Progress ratio={row.scoresFilled} />,
            },
            {
              key: "status",
              header: "Status",
              sort: (row) => Number(isReady(row)),
              cell: (row) =>
                isReady(row) ? (
                  <span className="badge badge-success">Siap Terbit</span>
                ) : (
                  <span className="badge badge-danger">Belum Lengkap</span>
                ),
            },
            {
              key: "aksi",
              header: "Aksi",
              cell: (row) => (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={readOnly || !isReady(row)}
                  title={
                    isReady(row)
                      ? undefined
                      : "Absensi dan nilai periode ini harus 100% terisi dulu."
                  }
                  onClick={() =>
                    notify.success(`Raport ${row.name} level ${row.level} diterbitkan.`)
                  }
                >
                  Terbitkan Raport
                </button>
              ),
            },
          ]}
        />
      </section>
    </div>
  )
}
