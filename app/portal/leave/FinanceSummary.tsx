import Link from "next/link"

import { formatDateTime } from "@/src/lib/format"
import { formatMoney } from "@/src/lib/money"

import { CardHeader } from "./CardHeader"
import { shortfall, type FinanceCalc, type PaymentProof } from "./leave"
import { SpecList } from "./SpecList"
import { UploadProofButton } from "./UploadProofButton"

export function FinanceSummary({ finance, proof }: { finance: FinanceCalc; proof?: PaymentProof }) {
  const due = shortfall(finance)

  return (
    <section className="card stack">
      <CardHeader
        title={proof ? "Bukti Pembayaran Terkirim" : "Yang Harus Dibayar"}
        note={proof ? "menunggu verifikasi Finance" : "selesaikan sebelum batas waktu"}
      />

      <div className="row row-between row-wrap" style={{ gap: 16 }}>
        <div className="stack" style={{ gap: 2 }}>
          <span className="spec-name">Kekurangan yang harus dibayar</span>
          <span className={`h4 tabular${proof ? "" : " text-danger"}`}>{formatMoney(due)}</span>
          <span className="caption text-muted">
            Batas pembayaran {formatDateTime(finance.deadline)}
          </span>
        </div>
        {!proof && <UploadProofButton amountDue={due} />}
      </div>

      <div className="grid-2">
        <SpecList items={[{ name: "Sudah Anda bayar", value: formatMoney(finance.totalPaid) }]} />
        <SpecList
          items={[
            {
              name: "Minimum pembayaran sebelum cuti",
              value: formatMoney(finance.minimumBeforeLeave),
            },
          ]}
        />
      </div>

      {proof ? (
        <div className="grid-2">
          <SpecList
            items={[
              { name: "Bukti Pembayaran", value: `${proof.name} · ${formatMoney(proof.amount)}` },
            ]}
          />
          <SpecList items={[{ name: "ID Transaksi", value: proof.trxId }]} />
        </div>
      ) : (
        <div className="card-soft card-tight row row-between row-wrap" style={{ gap: 12 }}>
          <span className="body-sm text-muted">
            Bayar lewat halaman Pembayaran, lalu unggah buktinya di sini.
          </span>
          <Link href="/portal/payments" className="btn btn-secondary btn-sm">
            Bayar Sekarang
          </Link>
        </div>
      )}
    </section>
  )
}
