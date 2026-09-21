"use client"

import { Select } from "@mantine/core"
import { useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import { formatPercent } from "@/src/lib/format"

import { AddMembersModal } from "./AddMembersModal"
import { TransferModal } from "./TransferModal"
import {
  capacityLabel,
  classLabel,
  CLASSES,
  type ClassMember,
  LOW_ATTENDANCE,
  MEMBER_STATUS_BADGE,
  MEMBERS_BY_CLASS,
  scheduleLabel,
} from "./sample"

const ACTIVE_CLASSES = CLASSES.filter((room) => room.status === "Aktif")

type Row = ClassMember & { readonly number: number }

const columnsFor = (onTransfer: (member: ClassMember) => void): readonly DataColumn<Row>[] => [
  {
    key: "number",
    header: "No",
    cell: (row) => <span className="tabular text-muted">{row.number}</span>,
  },
  {
    key: "nis",
    header: "NIS",
    sort: (row) => row.nis,
    cell: (row) => <span className="tabular">{row.nis}</span>,
  },
  {
    key: "name",
    header: "Nama Siswa",
    sort: (row) => row.name,
    cell: (row) => <span style={{ fontWeight: 600 }}>{row.name}</span>,
  },
  {
    key: "attendance",
    header: "Kehadiran (%)",
    sort: (row) => row.attendance,
    align: "right",
    cell: (row) => (
      <span className={row.attendance < LOW_ATTENDANCE ? "text-danger" : undefined}>
        {formatPercent(row.attendance)}
      </span>
    ),
  },
  {
    key: "averageScore",
    header: "Nilai Rata-rata",
    sort: (row) => row.averageScore,
    align: "right",
    cell: (row) => row.averageScore,
  },
  {
    key: "lastChapter",
    header: "Bab Terakhir",
    sort: (row) => row.lastChapter,
    cell: (row) => row.lastChapter,
  },
  {
    key: "status",
    header: "Status",
    sort: (row) => row.status,
    cell: (row) => <span className={`badge ${MEMBER_STATUS_BADGE[row.status]}`}>{row.status}</span>,
  },
  {
    key: "actions",
    header: "Aksi",
    align: "right",
    cell: (row) => (
      <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onTransfer(row)}
          disabled={row.status === "Keluar"}
          title={row.status === "Keluar" ? "Siswa sudah keluar dari kelas ini" : undefined}
        >
          Pindahkan
        </button>
        <button
          type="button"
          className="btn btn-danger-soft btn-sm"
          disabled={row.status === "Keluar"}
          title={row.status === "Keluar" ? "Siswa sudah keluar dari kelas ini" : undefined}
        >
          Keluarkan
        </button>
      </div>
    ),
  },
]

export function ClassMembers() {
  const [classId, setClassId] = useState(ACTIVE_CLASSES[0].id)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [transfer, setTransfer] = useState<{ readonly student?: ClassMember } | null>(null)
  const room = ACTIVE_CLASSES.find((candidate) => candidate.id === classId) ?? ACTIVE_CLASSES[0]
  const members = MEMBERS_BY_CLASS[room.id] ?? []
  const rows: readonly Row[] = members.map((member, index) => ({
    ...member,
    number: index + 1,
  }))

  const facts = [
    { label: "Pengajar", value: room.teacher },
    { label: "Level", value: `Deutsch ${room.level}` },
    { label: "Jadwal", value: scheduleLabel(room) },
    { label: "Kapasitas", value: `${capacityLabel(room)} Siswa` },
  ]

  return (
    <div className="stack">
      <section className="card">
        <div className="row row-between row-wrap" style={{ alignItems: "flex-end" }}>
          <Select
            label="Pilih kelas aktif"
            aria-label="Pilih kelas aktif"
            size="sm"
            w={260}
            allowDeselect={false}
            comboboxProps={{ position: "bottom-start" }}
            data={ACTIVE_CLASSES.map((candidate) => ({
              value: candidate.id,
              label: classLabel(candidate),
            }))}
            value={room.id}
            onChange={(value) => value && setClassId(value)}
          />
          <dl className="row row-wrap" style={{ gap: 24, margin: 0 }}>
            {facts.map(({ label, value }) => (
              <div key={label} className="stack" style={{ gap: 2 }}>
                <dt className="caption text-muted">{label}</dt>
                <dd className="body-sm" style={{ fontWeight: 600, margin: 0 }}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="card stack">
        <DataTable
          rows={rows}
          columns={columnsFor((member) => setTransfer({ student: member }))}
          rowKey={(row) => row.nis}
          emptyText={`Belum ada siswa di ${room.name}. Tambahkan lewat tombol di bawah tabel.`}
        />
        <div className="row row-wrap" style={{ gap: 8 }}>
          <button type="button" className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
            + Tambah Siswa ke Kelas
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setTransfer({})}
            disabled={members.length === 0}
            title={members.length === 0 ? `Belum ada siswa di ${room.name}` : undefined}
          >
            Pindahkan Siswa Massal
          </button>
        </div>
      </section>

      <AddMembersModal
        key={`add-${room.id}-${isAddOpen}`}
        opened={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        room={room}
      />
      <TransferModal
        key={`move-${room.id}-${transfer?.student?.nis ?? "bulk"}-${transfer !== null}`}
        opened={transfer !== null}
        onClose={() => setTransfer(null)}
        room={room}
        members={members}
        student={transfer?.student}
      />
    </div>
  )
}
