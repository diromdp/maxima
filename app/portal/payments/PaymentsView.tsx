"use client"

import { Skeleton, Title } from "@mantine/core"

import { QueryError } from "@/src/components/data/QueryError"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Notice } from "@/src/components/ui/Notice"
import { ownLeaveQuery } from "@/src/entities/leave/queries"
import type { LeaveDetail } from "@/src/entities/leave/schema"
import { portalPaymentsQuery } from "@/src/entities/portal/queries"
import { nextPaymentLabelOf, type PortalPayments } from "@/src/entities/portal/schema"
import { useRead } from "@/src/lib/api/use-read"
import { DASH, formatDate } from "@/src/lib/format"
import { eur, formatMoney, idr } from "@/src/lib/money"

import { EuroObligation } from "./EuroObligation"
import { PaymentHistory } from "./PaymentHistory"
import { type LeaveDue, PaymentPlanner } from "./PaymentPlanner"

const rupiah = (amount: number) => formatMoney(idr(amount))

const leaveDueOf = (leave: LeaveDetail): LeaveDue | null =>
  leave.state === "payment-set" && !leave.hasProof && leave.finance.amountIdr
    ? { number: leave.number, amountIdr: leave.finance.amountIdr }
    : null

function PlannerSkeleton() {
  return (
    <section className="card stack stack-sm" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <Skeleton height={24} width="35%" radius="xl" aria-hidden />
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} height={56} radius="md" aria-hidden />
      ))}
    </section>
  )
}

function subtitleOf({ package: plan }: PortalPayments): string {
  return [
    `Paket ${plan.name}`,
    `${plan.installments} angsuran`,
    plan.billingDay && `jatuh tempo tanggal ${plan.billingDay} tiap bulan`,
  ]
    .filter(Boolean)
    .join(" · ")
}

function StatCards({ payments }: { payments: PortalPayments }) {
  const { totals, nextInstallment, nextDueOn, package: plan } = payments
  const fee = payments.euro.serviceFeeEurCents
  const cards = [
    {
      label: "Total harga paket",
      value: rupiah(totals.finalPriceIdr),
      caption: `Paket ${plan.name}, ${plan.installments} angsuran.${
        fee ? ` Biaya sisi Jerman ${formatMoney(eur(fee))} ditagih terpisah.` : ""
      }`,
    },
    {
      label: "Sudah dibayar",
      value: rupiah(totals.paidIdr),
      tone: "success",
      caption:
        totals.overpaidIdr > 0
          ? `Lebih bayar ${rupiah(totals.overpaidIdr)}`
          : "Pembayaran Rupiah yang sudah berlaku",
    },
    {
      label: "Kekurangan",
      value: rupiah(totals.remainingIdr),
      tone: totals.remainingIdr > 0 ? "danger" : undefined,
      caption:
        nextInstallment && nextDueOn
          ? `${nextPaymentLabelOf(nextInstallment)} jatuh tempo ${formatDate(nextDueOn)}`
          : totals.remainingIdr > 0
            ? "Belum ada jadwal jatuh tempo"
            : "Pembayaran Rupiah sudah lunas",
    },
    {
      label: "Target per bulan",
      value: totals.monthlyIdr === null ? DASH : rupiah(totals.monthlyIdr),
      caption: plan.billingDay ? `Tanggal ${plan.billingDay} tiap bulan` : "Tanpa jadwal bulanan",
    },
  ]

  return (
    <div className="grid-4">
      {cards.map(({ label, value, caption, tone }) => (
        <section key={label} className="card stack stack-sm">
          <span className="label text-muted">{label}</span>
          <span className={`h4 tabular${tone ? ` text-${tone}` : ""}`}>{value}</span>
          <span className="caption text-muted">{caption}</span>
        </section>
      ))}
    </div>
  )
}

function PendingNotice({ rows }: { rows: PortalPayments["rupiah"] }) {
  const pending = rows.filter((row) => row.status === "Menunggu")
  if (pending.length === 0) return null

  return (
    <Notice tone="warning">
      {pending
        .map(
          (row) =>
            `Pembayaran ${rupiah(row.amount)} (${formatDate(row.paidOn)}) masih menunggu verifikasi Finance.`,
        )
        .join(" ")}{" "}
      Pembayaran berikutnya tetap bisa dilakukan.
    </Notice>
  )
}

function unlockSentence({ nextInstallment, unlocks }: PortalPayments): string | null {
  if (!nextInstallment) return null
  const payment =
    nextInstallment.kind === "dp" ? "Pelunasan DP" : `Pembayaran ke-${nextInstallment.number}`
  const head = `${payment} membawa total menjadi ${rupiah(unlocks.totalAfterNextIdr)}.`
  const gate = unlocks.nextGate
  if (!gate) return `${head} Seluruh layanan paket sudah terbuka.`
  const opened = unlocks.openAfterNext - unlocks.openNow
  return opened > 0
    ? `${head} Membuka ${opened} layanan baru, mulai dari ${gate.name}.`
    : `${head} Belum cukup untuk ${gate.name} yang butuh ${rupiah(gate.thresholdIdr)}.`
}

function UnlockCard({ payments }: { payments: PortalPayments }) {
  const { unlocks, nextInstallment } = payments
  const sentence = unlockSentence(payments)
  const rows = [
    { label: "Sekarang terbuka", open: unlocks.openNow },
    ...(nextInstallment
      ? [
          {
            label:
              nextInstallment.kind === "dp"
                ? "Setelah DP"
                : `Setelah angsuran ke-${nextInstallment.number}`,
            open: unlocks.openAfterNext,
          },
          {
            label: `Setelah angsuran ke-${(nextInstallment.number ?? 0) + 1}`,
            open: unlocks.openAfterFollowing,
          },
        ]
      : []),
  ]

  return (
    <section className="card stack">
      <Title order={2} size="h5">
        Yang Terbuka Setelah Bayar
      </Title>

      {sentence && <p className="body-sm">{sentence}</p>}

      <div className="stack stack-sm">
        {rows.map(({ label, open }) => (
          <div key={label} className="row row-between">
            <span className="body-sm">{label}</span>
            <span className="badge badge-terbuka">
              {open} dari {unlocks.total} layanan
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function ReminderCard({ isOnLeave }: { isOnLeave: boolean }) {
  return (
    <section className="card stack stack-sm">
      <Title order={2} size="h5">
        Pengingat
      </Title>
      <p className="body-sm">
        {isOnLeave
          ? "Selama masa cuti, tagihan dan pengingat berhenti. Pembayaran yang masuk tetap tercatat dan tetap membuka layanan."
          : "Pengingat dikirim lewat email sembilan hari sebelum jatuh tempo, pada hari jatuh tempo, dan tujuh hari sesudahnya bila belum dibayar."}
      </p>
    </section>
  )
}

function LeavePlanner({ payments, leaveId }: { payments: PortalPayments; leaveId: string }) {
  const leave = useRead(ownLeaveQuery(leaveId))
  if (leave.isPending) return <PlannerSkeleton />
  return (
    <PaymentPlanner
      payments={payments}
      leaveDue={leave.isSuccess ? leaveDueOf(leave.data) : null}
    />
  )
}

export function PaymentsView({
  isOnLeave,
  leaveId,
}: {
  isOnLeave: boolean
  leaveId: string | null
}) {
  const read = useRead(portalPaymentsQuery())

  if (read.isError) {
    return (
      <div className="stack stack-lg">
        <PageHeader title="Pembayaran" />
        <QueryError message={read.error.message} onRetry={() => void read.refetch()} />
      </div>
    )
  }
  if (read.isPending) return <PaymentsSkeleton />

  const payments = read.data

  return (
    <div className="stack stack-lg">
      <PageHeader title="Pembayaran" subtitle={subtitleOf(payments)} />

      <StatCards payments={payments} />

      <div className="grid-main-aside">
        <div className="stack stack-lg">
          <PendingNotice rows={payments.rupiah} />
          {leaveId ? (
            <LeavePlanner payments={payments} leaveId={leaveId} />
          ) : (
            <PaymentPlanner payments={payments} />
          )}
        </div>

        <div className="stack stack-lg">
          <UnlockCard payments={payments} />
          <ReminderCard isOnLeave={isOnLeave} />
        </div>
      </div>

      <PaymentHistory rows={payments.rupiah} />

      <EuroObligation euro={payments.euro} />
    </div>
  )
}

const HISTORY_SLOTS = 7

export function PaymentsSkeleton() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="30%" radius="xl" />
        <Skeleton height={16} width="55%" radius="xl" />
      </div>

      <div className="grid-4" aria-hidden>
        {Array.from({ length: 4 }, (_, index) => (
          <section key={index} className="card stack stack-sm">
            <Skeleton height={14} width="60%" radius="xl" />
            <Skeleton height={26} width="80%" radius="xl" />
            <Skeleton height={12} width="70%" radius="xl" />
          </section>
        ))}
      </div>

      <div className="grid-main-aside" aria-hidden>
        <section className="card stack stack-sm">
          <Skeleton height={24} width="35%" radius="xl" />
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} height={56} radius="md" />
          ))}
          <div className="grid-2">
            <Skeleton height={72} radius="md" />
            <Skeleton height={72} radius="md" />
          </div>
        </section>

        <div className="stack stack-lg">
          <section className="card stack stack-sm">
            <Skeleton height={24} width="60%" radius="xl" />
            <Skeleton height={40} radius="sm" />
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} height={20} radius="xl" />
            ))}
          </section>
          <section className="card stack stack-sm">
            <Skeleton height={24} width="40%" radius="xl" />
            <Skeleton height={40} radius="sm" />
          </section>
        </div>
      </div>

      <section className="card stack stack-sm" aria-hidden>
        <Skeleton height={24} width="40%" radius="xl" />
        <Skeleton height={36} radius="sm" />
        {Array.from({ length: HISTORY_SLOTS }, (_, index) => (
          <Skeleton key={index} height={44} radius="sm" />
        ))}
      </section>
    </div>
  )
}
