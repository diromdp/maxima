"use client"

import { Select, Skeleton } from "@mantine/core"
import { useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import { QueryError } from "@/src/components/data/QueryError"
import { activeClassesQuery, classMembersQuery } from "@/src/entities/class/queries"
import {
  capacityLabel,
  classLabel,
  type ClassRow,
  type MemberRow,
  type MemberStatus,
} from "@/src/entities/class/schema"
import { useRead } from "@/src/lib/api/use-read"
import { DASH } from "@/src/lib/format"
import { useUrlParam } from "@/src/lib/use-url-param"

import { AddMembersModal } from "./AddMembersModal"
import { Facts } from "./DialogParts"
import { ClassTableSkeleton } from "./MasterClassTable"
import { RemoveMemberModal } from "./RemoveMemberModal"
import { TransferModal } from "./TransferModal"

const LOW_ATTENDANCE = 75

const MEMBER_STATUS_BADGE: Readonly<Record<MemberStatus, string>> = {
  Aktif: "badge-beres",
  Cuti: "badge-berjalan",
  Keluar: "badge-tindakan",
}

type Row = MemberRow & { readonly number: number }

const formatScore = (value: number | null) =>
  value === null ? DASH : value.toLocaleString("id-ID", { maximumFractionDigits: 1 })

const LEFT_REASON = "Siswa sudah keluar dari kelas ini"

function columnsFor(
  canEdit: boolean,
  onTransfer: (member: MemberRow) => void,
  onRemove: (member: MemberRow) => void,
): readonly DataColumn<Row>[] {
  const columns: DataColumn<Row>[] = [
    {
      key: "number",
      header: "No",
      cell: (row) => <span className="tabular text-muted">{row.number}</span>,
    },
    {
      key: "nis",
      header: "NIS",
      sort: (row) => row.nis ?? "",
      cell: (row) => <span className="tabular">{row.nis ?? DASH}</span>,
    },
    {
      key: "name",
      header: "Nama Siswa",
      sort: (row) => row.fullName,
      cell: (row) => <span style={{ fontWeight: 600 }}>{row.fullName}</span>,
    },
    {
      key: "attendance",
      header: "Kehadiran (%)",
      sort: (row) => row.attendanceRate ?? -1,
      align: "right",
      cell: (row) =>
        row.attendanceRate === null ? (
          <span className="text-faint">{DASH}</span>
        ) : (
          <span className={`tabular${row.attendanceRate < LOW_ATTENDANCE ? " text-danger" : ""}`}>
            {Math.round(row.attendanceRate)}%
          </span>
        ),
    },
    {
      key: "averageScore",
      header: "Nilai Rata-rata",
      sort: (row) => row.averageScore ?? -1,
      align: "right",
      cell: (row) => <span className="tabular">{formatScore(row.averageScore)}</span>,
    },
    {
      key: "lastChapter",
      header: "Bab Terakhir",
      sort: (row) => row.lastChapter ?? "",
      cell: (row) => row.lastChapter ?? DASH,
    },
    {
      key: "status",
      header: "Status",
      sort: (row) => row.status,
      cell: (row) => (
        <span className={`badge ${MEMBER_STATUS_BADGE[row.status]}`}>{row.status}</span>
      ),
    },
  ]
  if (!canEdit) return columns
  return [
    ...columns,
    {
      key: "actions",
      header: "Aksi",
      align: "right",
      cell: (row) => {
        const hasLeft = row.status === "Keluar"
        return (
          <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onTransfer(row)}
              disabled={hasLeft}
              title={hasLeft ? LEFT_REASON : undefined}
            >
              Pindahkan
            </button>
            <button
              type="button"
              className="btn btn-danger-soft btn-sm"
              onClick={() => onRemove(row)}
              disabled={hasLeft}
              title={hasLeft ? LEFT_REASON : undefined}
            >
              Keluarkan
            </button>
          </div>
        )
      },
    },
  ]
}

export function ClassMembers({ canEdit }: { canEdit: boolean }) {
  const classes = useRead(activeClassesQuery())
  const [classId, setClassId] = useUrlParam("class", "")

  if (classes.isError) {
    return <QueryError message={classes.error.message} onRetry={() => void classes.refetch()} />
  }
  if (classes.isPending) return <MembersSkeleton />

  const activeClasses = classes.data.data
  const room = activeClasses.find((candidate) => candidate.id === classId) ?? activeClasses[0]
  if (!room) {
    return (
      <section className="card">
        <p className="body-sm text-muted">
          Belum ada kelas berstatus Aktif. Aktifkan kelas di tab Master Kelas supaya anggotanya
          dapat diatur di sini.
        </p>
      </section>
    )
  }

  return (
    <div className="stack">
      <section className="card">
        <div className="row row-between row-wrap" style={{ alignItems: "flex-end" }}>
          <Select
            label="Pilih kelas aktif"
            size="sm"
            w={260}
            allowDeselect={false}
            searchable
            comboboxProps={{ position: "bottom-start" }}
            data={activeClasses.map((candidate) => ({
              value: candidate.id,
              label: classLabel(candidate),
            }))}
            value={room.id}
            onChange={(value) => value && setClassId(value)}
          />
          <Facts
            items={[
              { label: "Pengajar", value: room.teacher?.name ?? "Belum ada" },
              { label: "Level", value: `Deutsch ${room.level.name}` },
              { label: "Jadwal", value: room.schedule },
              { label: "Kapasitas", value: `${capacityLabel(room)} Siswa` },
            ]}
          />
        </div>
      </section>

      <MembersTable key={room.id} room={room} canEdit={canEdit} />
    </div>
  )
}

type Dialog =
  | { readonly kind: "add" }
  | { readonly kind: "transfer"; readonly student?: MemberRow }
  | { readonly kind: "remove"; readonly student: MemberRow }

function MembersTable({ room, canEdit }: { room: ClassRow; canEdit: boolean }) {
  const members = useRead(classMembersQuery(room.id))
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const close = () => setDialog(null)

  if (members.isError) {
    return <QueryError message={members.error.message} onRetry={() => void members.refetch()} />
  }

  const memberRows = members.data?.data ?? []
  const movable = memberRows.filter((member) => member.status !== "Keluar")
  const rows: readonly Row[] = memberRows.map((member, index) => ({ ...member, number: index + 1 }))

  return (
    <section className="card stack">
      {members.isPending ? (
        <ClassTableSkeleton />
      ) : (
        <DataTable
          rows={rows}
          columns={columnsFor(
            canEdit,
            (student) => setDialog({ kind: "transfer", student }),
            (student) => setDialog({ kind: "remove", student }),
          )}
          rowKey={(row) => `${row.studentId}-${row.joinedOn}`}
          emptyText={`Belum ada siswa di ${room.name}.${canEdit ? " Tambahkan lewat tombol di bawah tabel." : ""}`}
        />
      )}

      {canEdit && (
        <div className="row row-wrap" style={{ gap: 8 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setDialog({ kind: "add" })}
          >
            + Tambah Siswa ke Kelas
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setDialog({ kind: "transfer" })}
            disabled={movable.length === 0}
            title={
              movable.length === 0
                ? `Belum ada siswa yang dapat dipindahkan dari ${room.name}`
                : undefined
            }
          >
            Pindahkan Siswa Massal
          </button>
        </div>
      )}

      {dialog?.kind === "add" && <AddMembersModal room={room} onClose={close} />}
      {dialog?.kind === "transfer" && (
        <TransferModal room={room} members={movable} student={dialog.student} onClose={close} />
      )}
      {dialog?.kind === "remove" && (
        <RemoveMemberModal room={room} student={dialog.student} onClose={close} />
      )}
    </section>
  )
}

function MembersSkeleton() {
  return (
    <div className="stack" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <Skeleton height={88} radius="md" aria-hidden />
      <section className="card">
        <ClassTableSkeleton />
      </section>
    </div>
  )
}
