import { Title } from "@mantine/core"

import { Notice } from "@/src/components/ui/Notice"
import { EURO_STATUS, type PortalPayments } from "@/src/entities/portal/schema"
import { DASH, formatDate } from "@/src/lib/format"
import { eur, formatMoney } from "@/src/lib/money"

const euro = (cents: number | null) => (cents === null ? DASH : formatMoney(eur(cents)))

export function EuroObligation({ euro: lane }: { euro: PortalPayments["euro"] }) {
  const remaining = lane.remainingEurCents ?? 0
  const figures = [
    { label: "Biaya sisi Jerman", value: euro(lane.serviceFeeEurCents), tone: "" },
    { label: "Sudah disahkan", value: euro(lane.paidEurCents), tone: " text-success" },
    {
      label: "Sisa",
      value: euro(lane.remainingEurCents),
      tone: remaining > 0 ? " text-danger" : "",
    },
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
        {lane.pendingEurCents > 0
          ? ` Saat ini ${euro(lane.pendingEurCents)} sudah tercatat dan masih menunggu pengesahan.`
          : ""}
      </Notice>

      {lane.rows.length === 0 ? (
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
              {lane.rows.map((payment) => (
                <tr key={payment.id}>
                  <td>{formatDate(payment.paidOn)}</td>
                  <td>{payment.branch ?? DASH}</td>
                  <td className="numeric tabular">{euro(payment.amount)}</td>
                  <td>
                    <span className={`badge badge-${EURO_STATUS[payment.status].tone}`}>
                      {EURO_STATUS[payment.status].label}
                    </span>
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
