"use client"

import { Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { modals } from "@mantine/modals"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { QueryError } from "@/src/components/data/QueryError"
import { TableSkeleton } from "@/src/components/data/TableSkeleton"
import { masterItemsQuery } from "@/src/entities/master-data/queries"
import { removePackage } from "@/src/entities/package/actions"
import { packagesQuery } from "@/src/entities/package/queries"
import type { PackageView } from "@/src/entities/package/schema"
import { useRead } from "@/src/lib/api/use-read"
import { DASH } from "@/src/lib/format"
import { eur, formatMoney, idr } from "@/src/lib/money"
import { notify } from "@/src/lib/notify"

import { PackageFormModal } from "./PackageFormModal"

const SKELETON_ROWS = 6
const PACKAGE_COLUMNS = 9
const GATE_COLUMNS = 10

const yesNo = (value: boolean) => (value ? "Ya" : "Tidak")

const formatGate = (value: number | null): string =>
  value === null ? DASH : value === 0 ? "0" : formatMoney(idr(value))

const gateTone = (value: number | null): string =>
  value === null ? " text-muted" : value === 0 ? " text-success" : ""

function PackageName({ row }: { row: PackageView }) {
  return (
    <div className="stack" style={{ gap: 2, alignItems: "flex-start" }}>
      <span style={{ fontWeight: 600 }}>{row.name}</span>
      <span className="caption text-muted">{row.program.name}</span>
      {row.status === "Nonaktif" && <span className="badge badge-tindakan">Nonaktif</span>}
    </div>
  )
}

export function PackagesTab({ readOnly }: { readOnly: boolean }) {
  const queryClient = useQueryClient()
  const packages = useRead(packagesQuery())
  const masterItems = useRead(masterItemsQuery())
  const [editing, setEditing] = useState<PackageView | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const gates = masterItems.data?.data.filter((item) => item.type === "gate") ?? []
  const rows = packages.data?.data
  const error = packages.error ?? masterItems.error
  const retry = () => {
    void packages.refetch()
    void masterItems.refetch()
  }

  const confirmDelete = (row: PackageView) =>
    modals.openConfirmModal({
      title: `Hapus ${row.name}?`,
      children: (
        <p className="body-sm">
          {row.name} beserta sembilan gerbangnya dihapus dan tidak lagi dapat dipilih di formulir
          pendaftaran. Paket yang sudah dipakai kontrak tidak dapat dihapus; nonaktifkan saja lewat
          Edit.
        </p>
      ),
      labels: { confirm: "Hapus", cancel: "Batal" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        const result = await removePackage(row.id)
        if (!result.ok) return notify.error(result.message)
        notify.success(`${row.name} dihapus.`)
        await queryClient.invalidateQueries({ queryKey: ["packages"] })
      },
    })

  const close = () => {
    setEditing(null)
    setIsAdding(false)
  }

  const body = (content: (rows: readonly PackageView[]) => React.ReactNode, columns: number) =>
    error ? (
      <QueryError message={error.message} onRetry={retry} />
    ) : rows === undefined || masterItems.data === undefined ? (
      <TableSkeleton columns={columns} rows={SKELETON_ROWS} />
    ) : rows.length === 0 ? (
      <p className="body-sm text-muted">
        Belum ada paket. Tambahkan paket pertama lewat Tambah Paket.
      </p>
    ) : (
      content(rows)
    )

  return (
    <div className="stack stack-lg">
      <section className="card stack">
        <div className="row row-between row-wrap">
          <div className="stack stack-sm">
            <h2 className="h6">Paket Program</h2>
            <span className="caption text-muted">
              {rows ? `${rows.length} paket. ` : ""}Nominal bulanan dan tanggal tagih melekat pada
              paket, bukan pada siswa.
            </span>
          </div>
          {!readOnly && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsAdding(true)}
            >
              + Tambah Paket
            </button>
          )}
        </div>

        {body(
          (list) => (
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama Paket</th>
                    <th>Cakupan Level</th>
                    <th className="numeric">Harga Layanan (Rp)</th>
                    <th className="numeric">Harga Layanan (Euro)</th>
                    <th>Dana Talang ID</th>
                    <th>Dana Talang DE</th>
                    <th className="numeric">Nominal Bulanan</th>
                    <th>Tanggal Tagih</th>
                    {!readOnly && <th>Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {list.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <PackageName row={row} />
                      </td>
                      <td>
                        {row.levels.length === 0
                          ? DASH
                          : row.levels.map((level) => level.name).join(", ")}
                      </td>
                      <td className="numeric tabular">{formatMoney(idr(row.priceIdr))}</td>
                      <td className="numeric tabular">
                        {row.serviceFeeEurCents === null
                          ? DASH
                          : formatMoney(eur(row.serviceFeeEurCents))}
                      </td>
                      <td>{yesNo(row.bridgingFundIdr)}</td>
                      <td>{yesNo(row.bridgingFundEur)}</td>
                      <td className="numeric tabular">
                        {row.monthlyIdr !== null ? (
                          formatMoney(idr(row.monthlyIdr))
                        ) : (
                          <div className="stack" style={{ gap: 0 }}>
                            <span>{DASH}</span>
                            {row.monthlyEstimateIdr !== null && (
                              <span className="caption text-muted">
                                Perkiraan {formatMoney(idr(row.monthlyEstimateIdr))}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td>{row.billingDay === null ? DASH : `Tgl ${row.billingDay}`}</td>
                      {!readOnly && (
                        <td>
                          <div className="row" style={{ gap: 0 }}>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => setEditing(row)}
                            >
                              <HugeiconsIcon icon={PencilEdit02Icon} size={16} strokeWidth={1.5} />
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-icon btn-sm text-faint"
                              aria-label={`Hapus ${row.name}`}
                              title="Hapus"
                              onClick={() => confirmDelete(row)}
                            >
                              <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
          PACKAGE_COLUMNS,
        )}
      </section>

      <section className="card stack">
        <div className="stack stack-sm">
          <h2 className="h6">9 Gerbang Pembayaran (Rincian Termin Minimum)</h2>
          <span className="caption text-muted">
            Uang Rupiah yang harus masuk sebelum layanan itu dibuka, dibandingkan dengan total
            masuk. Euro tidak menahan gerbang mana pun.
          </span>
        </div>

        {body(
          (list) => (
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Paket Program</th>
                    {gates.map((gate) => (
                      <th key={gate.id} className="numeric">
                        {gate.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.map((row) => {
                    const thresholdOf = new Map(
                      row.gates.map((gate) => [gate.id, gate.thresholdIdr]),
                    )
                    return (
                      <tr key={row.id}>
                        <td style={{ fontWeight: 600 }}>{row.name}</td>
                        {gates.map((gate) => {
                          const value = thresholdOf.get(gate.id) ?? null
                          return (
                            <td key={gate.id} className={`numeric tabular${gateTone(value)}`}>
                              {formatGate(value)}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ),
          GATE_COLUMNS,
        )}

        <div className="stack" style={{ gap: 2 }}>
          <span className="caption text-muted">
            Keterangan: <strong>0</strong> = langsung terbuka (termasuk paket). <strong>—</strong> =
            tidak termasuk layanan paket program.
          </span>
          <span className="caption text-muted">Setiap perubahan dicatat di log aktivitas.</span>
        </div>
      </section>

      {(isAdding || editing) && masterItems.data && (
        <PackageFormModal
          initial={editing ?? undefined}
          masterItems={masterItems.data.data}
          onClose={close}
        />
      )}
    </div>
  )
}
