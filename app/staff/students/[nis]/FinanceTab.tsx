"use client"

import { studentFinanceQuery } from "@/src/entities/student/queries"
import type { PaymentRow, StudentFinance } from "@/src/entities/student/schema"
import { useRead } from "@/src/lib/api/use-read"
import { formatDate } from "@/src/lib/format"
import { eur, formatMoney, idr, type Money } from "@/src/lib/money"

import { EmptyText, Panel, TabBody } from "./Panel"

const DASH = "-"

const PAYMENT_BADGE: Readonly<Record<PaymentRow["status"], string>> = {
  Otomatis: "badge-beres",
  Disahkan: "badge-beres",
  Menunggu: "badge-berjalan",
  Ditolak: "badge-tindakan",
}

const moneyOf = (row: PaymentRow): Money =>
  row.currency === "IDR" ? idr(row.amount) : eur(row.amount)

const descriptionOf = (row: PaymentRow) =>
  row.kind === "Dana Talang"
    ? "Dana Talang"
    : row.isDownPayment
      ? "DP"
      : row.sequence
        ? `Angsuran ke-${row.sequence}`
        : "Pembayaran"

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "success" | "danger"
}) {
  return (
    <div className="card stack" style={{ gap: 2 }}>
      <span className="caption text-muted">{label}</span>
      <span className={`h5 tabular${tone ? ` text-${tone}` : ""}`}>{value}</span>
    </div>
  )
}

function PaymentTable({ rows, emptyText }: { rows: readonly PaymentRow[]; emptyText: string }) {
  if (rows.length === 0) return <EmptyText>{emptyText}</EmptyText>
  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Tanggal</th>
            <th scope="col">Keterangan</th>
            <th scope="col">Metode</th>
            <th scope="col" className="numeric">
              Nominal
            </th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="tabular">{formatDate(row.paidOn)}</td>
              <td>{descriptionOf(row)}</td>
              <td>{row.method}</td>
              <td className="numeric tabular">{formatMoney(moneyOf(row))}</td>
              <td>
                <span className={`badge ${PAYMENT_BADGE[row.status]}`}>{row.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FinanceView({ finance }: { finance: StudentFinance }) {
  const { totals, euro } = finance
  const hasEuro = euro.serviceFeeEurCents !== null || euro.rows.length > 0

  return (
    <div className="grid-main-aside">
      <div className="stack">
        <div className="grid-4">
          <Stat label="Total Harga Paket" value={formatMoney(idr(totals.finalPriceIdr))} />
          <Stat label="Sudah Dibayar" value={formatMoney(idr(totals.paidIdr))} tone="success" />
          <Stat
            label="Kekurangan"
            value={formatMoney(idr(totals.remainingIdr))}
            tone={totals.remainingIdr > 0 ? "danger" : undefined}
          />
          <Stat
            label="Target per Bulan"
            value={totals.monthlyIdr === null ? DASH : formatMoney(idr(totals.monthlyIdr))}
          />
        </div>

        {totals.overpaidIdr > 0 && (
          <p className="body-sm text-muted">
            Kelebihan bayar Rupiah {formatMoney(idr(totals.overpaidIdr))}.
          </p>
        )}

        {hasEuro && (
          <div className="grid-4">
            <Stat
              label="Biaya Layanan Euro"
              value={
                euro.serviceFeeEurCents === null ? DASH : formatMoney(eur(euro.serviceFeeEurCents))
              }
            />
            <Stat label="Euro Dibayar" value={formatMoney(eur(euro.paidEurCents))} tone="success" />
            <Stat
              label="Kekurangan Euro"
              value={
                euro.remainingEurCents === null ? DASH : formatMoney(eur(euro.remainingEurCents))
              }
              tone={(euro.remainingEurCents ?? 0) > 0 ? "danger" : undefined}
            />
          </div>
        )}

        <Panel title="Riwayat Pembayaran Rupiah">
          <PaymentTable rows={finance.rupiah} emptyText="Belum ada pembayaran Rupiah." />
        </Panel>

        {hasEuro && (
          <Panel title="Riwayat Pembayaran Euro">
            <PaymentTable rows={euro.rows} emptyText="Belum ada pembayaran Euro." />
          </Panel>
        )}
      </div>

      <Panel title="Gerbang Layanan">
        <div className="list-rows">
          {finance.gates.map((gate) => {
            const isOpen = gate.status !== "Belum Terbuka"
            return (
              <div key={gate.code} className="row row-between">
                <div className="stack" style={{ gap: 0 }}>
                  <span className="body-sm" style={{ fontWeight: 600 }}>
                    {gate.name}
                  </span>
                  <span className="caption text-muted tabular">
                    Ambang {formatMoney(idr(gate.thresholdIdr))}
                  </span>
                </div>
                <div className="stack" style={{ gap: 2, alignItems: "flex-end" }}>
                  <span className={`badge ${isOpen ? "badge-terbuka" : "badge-terkunci"}`}>
                    {isOpen ? "Terbuka" : "Belum Terbuka"}
                  </span>
                  {!isOpen && (
                    <span className="caption text-danger tabular">
                      Kurang {formatMoney(idr(gate.shortfallIdr))}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <p className="caption text-muted">
          Gerbang terbuka otomatis saat total pembayaran Rupiah mencapai ambangnya.
        </p>
      </Panel>
    </div>
  )
}

export function FinanceTab({ nis }: { nis: string }) {
  const finance = useRead(studentFinanceQuery(nis))
  return <TabBody query={finance}>{(data) => <FinanceView finance={data} />}</TabBody>
}
