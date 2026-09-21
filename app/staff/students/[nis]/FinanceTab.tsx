import { formatDate } from "@/src/lib/format"
import { formatMoney, gte, shortfall, subtract, sum } from "@/src/lib/money"

import { Panel } from "./Panel"
import { GATES, MONTHLY_TARGET, PACKAGE_PRICE, TRANSACTIONS } from "./sample"

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

export function FinanceTab() {
  const paid = sum(
    TRANSACTIONS.filter((t) => t.status === "Lunas").map((t) => t.amount),
    "IDR",
  )
  const remaining = subtract(PACKAGE_PRICE, paid)

  return (
    <div className="grid-main-aside">
      <div className="stack">
        <div className="grid-4">
          <Stat label="Total Harga Paket" value={formatMoney(PACKAGE_PRICE)} />
          <Stat label="Sudah Dibayar" value={formatMoney(paid)} tone="success" />
          <Stat
            label="Kekurangan"
            value={formatMoney(remaining)}
            tone={remaining.amount > 0 ? "danger" : undefined}
          />
          <Stat label="Target per Bulan" value={formatMoney(MONTHLY_TARGET)} />
        </div>

        <Panel
          title="Riwayat Pembayaran"
          aside={
            <button type="button" className="btn btn-secondary btn-sm">
              Ekspor
            </button>
          }
        >
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Keterangan</th>
                  <th>Metode</th>
                  <th className="numeric">Nominal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {TRANSACTIONS.map((t) => (
                  <tr key={t.id}>
                    <td className="tabular">{formatDate(t.date)}</td>
                    <td>{t.description}</td>
                    <td>{t.method}</td>
                    <td className="numeric">{formatMoney(t.amount)}</td>
                    <td>
                      <span
                        className={`badge ${t.status === "Lunas" ? "badge-beres" : "badge-berjalan"}`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <Panel title="Gerbang Layanan">
        <div className="list-rows">
          {GATES.map((gate) => {
            const isOpen = gte(paid, gate.threshold)
            return (
              <div key={gate.name} className="row row-between">
                <div className="stack" style={{ gap: 0 }}>
                  <span className="body-sm" style={{ fontWeight: 600 }}>
                    {gate.name}
                  </span>
                  <span className="caption text-muted tabular">
                    Ambang {formatMoney(gate.threshold)}
                  </span>
                </div>
                <div className="stack" style={{ gap: 2, alignItems: "flex-end" }}>
                  <span className={`badge ${isOpen ? "badge-terbuka" : "badge-terkunci"}`}>
                    {isOpen ? "Terbuka" : "Terkunci"}
                  </span>
                  {!isOpen && (
                    <span className="caption text-danger tabular">
                      Kurang {formatMoney(shortfall(gate.threshold, paid))}
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
