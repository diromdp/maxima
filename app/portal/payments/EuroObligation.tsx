import { Title } from "@mantine/core"

import { Notice } from "@/src/components/ui/Notice"
import { formatDate } from "@/src/lib/format"
import { formatMoney } from "@/src/lib/money"

import {
  EURO_PAYMENTS,
  type EuroStatus,
  PACKAGE_PRICE_EUR,
  pendingEuro,
  ratifiedEuro,
  shortfallEuro,
} from "./payments"

const BADGE: Readonly<Record<EuroStatus, string>> = {
  Disahkan: "badge-beres",
  "Menunggu pengesahan": "badge-berjalan",
}

export function EuroObligation() {
  const ratified = ratifiedEuro(EURO_PAYMENTS)
  const pending = pendingEuro(EURO_PAYMENTS)
  const due = shortfallEuro(EURO_PAYMENTS)

  const figures = [
    { label: "Biaya sisi Jerman", value: formatMoney(PACKAGE_PRICE_EUR), tone: "" },
    { label: "Sudah disahkan", value: formatMoney(ratified), tone: " text-success" },
    { label: "Sisa", value: formatMoney(due), tone: due.amount > 0 ? " text-danger" : "" },
  ]

  return (
    <section className="card stack">
      <div className="stack stack-sm">
        <Title order={2} size="h5">
          Kewajiban Euro
        </Title>
        <span className="caption text-muted">
          Ditagih terpisah dari angsuran Rupiah dan tidak pernah dijumlahkan dengannya.
        </span>
      </div>

      <div className="grid-3">
        {figures.map(({ label, value, tone }) => (
          <div key={label} className="stack" style={{ gap: 2 }}>
            <span className="caption text-muted">{label}</span>
            <span className={`h5 tabular${tone}`}>{value}</span>
          </div>
        ))}
      </div>

      <Notice tone="info">
        Euro dibayar tunai di kantor cabang. Staf Finance mencatatnya, lalu Manajer Finance
        mengesahkan. Nominal terhitung sejak disahkan, dan kewajiban ini tidak menahan satu layanan
        pun.
        {pending.amount > 0
          ? ` Saat ini ${formatMoney(pending)} sudah tercatat dan masih menunggu pengesahan.`
          : ""}
      </Notice>

      {EURO_PAYMENTS.length === 0 ? (
        <p className="body-sm text-muted">
          Belum ada pembayaran Euro yang tercatat. Datang ke kantor cabang untuk membayar.
        </p>
      ) : (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Tanggal</th>
                <th scope="col">Cabang</th>
                <th scope="col" className="numeric">
                  Nominal
                </th>
                <th scope="col">Status</th>
                <th scope="col">Disahkan oleh</th>
              </tr>
            </thead>
            <tbody>
              {EURO_PAYMENTS.map((payment) => (
                <tr key={payment.id}>
                  <td>{formatDate(payment.date)}</td>
                  <td>{payment.branch}</td>
                  <td className="numeric tabular">{formatMoney(payment.amount)}</td>
                  <td>
                    <span className={`badge ${BADGE[payment.status]}`}>{payment.status}</span>
                  </td>
                  <td>
                    {payment.ratifiedBy ?? <span className="text-muted">Belum disahkan</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
