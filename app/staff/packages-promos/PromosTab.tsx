"use client"

import { Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { modals } from "@mantine/modals"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { DataTable } from "@/src/components/data/DataTable"
import { ListFilter } from "@/src/components/data/ListFilter"
import { ListSearch } from "@/src/components/data/ListSearch"
import { QueryError } from "@/src/components/data/QueryError"
import { TableSkeleton } from "@/src/components/data/TableSkeleton"
import { removePromo } from "@/src/entities/package/actions"
import { packagesQuery, PROMO_FILTERS, promosQuery } from "@/src/entities/package/queries"
import { PROMO_STATUSES, type PromoStatus, type PromoView } from "@/src/entities/package/schema"
import { useRead } from "@/src/lib/api/use-read"
import { formatDateRange } from "@/src/lib/format"
import { formatMoney, idr } from "@/src/lib/money"
import { notify } from "@/src/lib/notify"
import { useListParams } from "@/src/lib/use-list-params"

import { PromoFormModal } from "./PromoFormModal"

const SKELETON_ROWS = 5
const PROMO_COLUMNS = 8

const PROMO_STATUS_BADGE: Readonly<Record<PromoStatus, string>> = {
  AKTIF: "badge-success",
  DRAFT: "badge-neutral",
  KEDALUWARSA: "badge-danger",
}

const STATUS_OPTIONS = PROMO_STATUSES.map((status) => ({ value: status, label: status }))

const formatDiscount = (promo: PromoView): string =>
  promo.discountType === "Persentase" ? `${promo.percent}%` : formatMoney(idr(promo.amountIdr ?? 0))

const appliesToLabel = (promo: PromoView): string =>
  promo.packages.length === 0 ? "Semua Paket" : promo.packages.map((pkg) => pkg.name).join(", ")

export function PromosTab({ readOnly }: { readOnly: boolean }) {
  const queryClient = useQueryClient()
  const { params } = useListParams(PROMO_FILTERS)
  const promos = useRead(promosQuery(params))
  const packages = useRead(packagesQuery())
  const [editing, setEditing] = useState<PromoView | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const close = () => {
    setEditing(null)
    setIsAdding(false)
  }

  const confirmDelete = (promo: PromoView) =>
    modals.openConfirmModal({
      title: `Hapus ${promo.name}?`,
      children: (
        <p className="body-sm">
          Kode {promo.code} tidak lagi dapat dipakai di formulir pendaftaran. Promo yang sudah
          dipakai kontrak tidak dapat dihapus; ubah statusnya jadi DRAFT lewat Edit.
        </p>
      ),
      labels: { confirm: "Hapus", cancel: "Batal" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        const result = await removePromo(promo.id)
        if (!result.ok) return notify.error(result.message)
        notify.success(`${promo.name} dihapus.`)
        await queryClient.invalidateQueries({ queryKey: ["promos"] })
      },
    })

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="row row-wrap" style={{ gap: 8 }}>
          <ListSearch label="Cari kode voucher atau nama promo" />
          <ListFilter name="status" label="Status" options={STATUS_OPTIONS} />
        </div>
        {!readOnly && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsAdding(true)}
          >
            Tambah Promo
          </button>
        )}
      </div>

      {promos.error ? (
        <QueryError message={promos.error.message} onRetry={() => void promos.refetch()} />
      ) : promos.data === undefined ? (
        <TableSkeleton columns={PROMO_COLUMNS} rows={SKELETON_ROWS} />
      ) : (
        <DataTable<PromoView>
          rows={promos.data.data}
          rowKey={(promo) => promo.id}
          defaultSort={{ key: "periode", dir: "desc" }}
          emptyText={
            params.search || params.status
              ? "Tidak ada promo yang cocok."
              : "Belum ada promo. Tambahkan lewat Tambah Promo."
          }
          columns={[
            {
              key: "nama",
              header: "Nama Promo",
              sort: (promo) => promo.name,
              cell: (promo) => (
                <div className="stack" style={{ gap: 0 }}>
                  <span style={{ fontWeight: 600 }}>{promo.name}</span>
                  <span className="caption text-muted">{promo.code}</span>
                </div>
              ),
            },
            {
              key: "jenis",
              header: "Jenis Diskon",
              sort: (promo) => promo.discountType,
              cell: (promo) => promo.discountType,
            },
            {
              key: "nilai",
              header: "Nilai Diskon",
              align: "right",
              cell: formatDiscount,
            },
            { key: "berlaku", header: "Berlaku Untuk", wrap: true, cell: appliesToLabel },
            {
              key: "periode",
              header: "Periode Promo",
              sort: (promo) => promo.startsOn,
              cell: (promo) => formatDateRange(promo.startsOn, promo.endsOn),
            },
            {
              key: "status",
              header: "Status",
              sort: (promo) => promo.status,
              cell: (promo) => (
                <span className={`badge ${PROMO_STATUS_BADGE[promo.status]}`}>{promo.status}</span>
              ),
            },
            {
              key: "digunakan",
              header: "Digunakan",
              align: "right",
              sort: (promo) => promo.usedCount,
              cell: (promo) => `${promo.usedCount} kali`,
            },
            ...(readOnly
              ? []
              : [
                  {
                    key: "aksi",
                    header: "Aksi",
                    cell: (promo: PromoView) => (
                      <div className="row" style={{ gap: 0 }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setEditing(promo)}
                        >
                          <HugeiconsIcon icon={PencilEdit02Icon} size={16} strokeWidth={1.5} />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon btn-sm text-faint"
                          aria-label={`Hapus ${promo.name}`}
                          title="Hapus"
                          onClick={() => confirmDelete(promo)}
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.5} />
                        </button>
                      </div>
                    ),
                  },
                ]),
          ]}
        />
      )}

      {(isAdding || editing) && (
        <PromoFormModal
          key={editing?.id ?? "new"}
          initial={editing ?? undefined}
          packages={packages.data?.data ?? []}
          onClose={close}
        />
      )}
    </section>
  )
}
