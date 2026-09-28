"use client"

import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Skeleton, TextInput } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { useState } from "react"

import { QueryError } from "@/src/components/data/QueryError"
import { groupReportQuery } from "@/src/entities/report/queries"
import { type GroupBy, type GroupReportRow, UNGROUPED_ID } from "@/src/entities/report/schema"
import { useRead } from "@/src/lib/api/use-read"
import { formatMoney, idr } from "@/src/lib/money"

import { StudentsModal } from "./StudentsModal"
import { SummaryTable } from "./SummaryTable"
import { useReportSearch } from "./use-report-param"

const SEARCH_DELAY_MS = 300
const SKELETON_ROWS = 5

const GROUPS: Readonly<
  Record<
    GroupBy,
    { title: string; caption: string; head: string; modalTitle: string; empty: string }
  >
> = {
  package: {
    title: "Per Paket Program",
    caption:
      "Penagihan = harga paket seluruh siswa; pemasukan = transaksi berlaku; piutang selisihnya. Rupiah dan Euro tidak dijumlahkan.",
    head: "Nama Paket",
    modalTitle: "Siswa paket",
    empty: "Belum ada siswa berpaket dalam cakupanmu.",
  },
  branch: {
    title: "Per Cabang",
    caption: "Performa keuangan tiap cabang, ditutup baris total keseluruhan.",
    head: "Cabang",
    modalTitle: "Siswa cabang",
    empty: "Belum ada siswa berpaket dalam cakupanmu.",
  },
  pic: {
    title: "Per PIC Marketing",
    caption:
      "Uang yang masuk dari siswa di bawah tiap PIC. Jumlah siswa dan kontraknya ada di Performa Marketing.",
    head: "Nama PIC Marketing",
    modalTitle: "Siswa di bawah",
    empty: "Tidak ada PIC yang cocok dengan pencarian.",
  },
}

export function GroupReportTab({ by }: { by: GroupBy }) {
  const group = GROUPS[by]
  const [search, setSearch] = useReportSearch()
  const [debouncedSearch] = useDebouncedValue(search.trim(), SEARCH_DELAY_MS)
  const report = useRead(groupReportQuery(by, by === "pic" ? debouncedSearch : undefined))
  const [detail, setDetail] = useState<GroupReportRow | null>(null)

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="stack stack-sm">
          <h2 className="h6">{group.title}</h2>
          <span className="caption text-muted">{group.caption}</span>
        </div>
        {by === "pic" && (
          <TextInput
            aria-label="Cari nama PIC"
            placeholder="Cari nama PIC"
            size="sm"
            leftSection={<HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.5} />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            style={{ flex: "1 1 200px", maxWidth: 280 }}
          />
        )}
      </div>

      {report.isError ? (
        <QueryError message={report.error.message} onRetry={() => void report.refetch()} />
      ) : report.isPending ? (
        <div className="stack" aria-busy="true">
          <span className="sr-only" role="status">
            Memuat
          </span>
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <Skeleton key={index} height={44} radius="sm" aria-hidden />
          ))}
        </div>
      ) : report.data.rows.length === 0 ? (
        <div className="row-soft">
          <span className="body-sm text-muted">{group.empty}</span>
        </div>
      ) : (
        <SummaryTable
          head={group.head}
          rows={report.data.rows}
          total={report.data.total}
          extra={(row) => (
            <div className="row" style={{ gap: 8 }}>
              {row.packagePriceIdr !== null && (
                <span className="caption text-muted">
                  Harga {formatMoney(idr(row.packagePriceIdr))}
                </span>
              )}
              {row.studentCount > 0 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setDetail(row)}
                >
                  Lihat siswa
                </button>
              )}
            </div>
          )}
        />
      )}

      {detail && (
        <StudentsModal
          title={`${group.modalTitle} ${detail.name}`}
          by={by}
          groupId={detail.id ?? UNGROUPED_ID}
          onClose={() => setDetail(null)}
        />
      )}
    </section>
  )
}
