"use client"

import { Group, Modal, NumberInput, Radio, Stack, Text, Title } from "@mantine/core"
import { Dropzone, MIME_TYPES } from "@mantine/dropzone"
import { notify } from "@/src/lib/notify"
import { useState } from "react"

import { DropzoneBody } from "@/src/components/ui/DropzoneBody"
import { formatDate, formatFileSize } from "@/src/lib/format"
import { formatMoney, idr, type Money } from "@/src/lib/money"
import { Notice } from "@/src/components/ui/Notice"

import {
  gatewayFee,
  installmentLabel,
  monthlyTarget,
  nextInstallmentNumber,
  type PaymentMethod,
  pendingTransactions,
  projectionSentence,
  shortfallAmount,
  totalCharged,
  TRANSACTIONS,
  unlockOutlook,
} from "./payments"

const UPLOAD_MAX_BYTES = 5 * 1024 * 1024
const UPLOAD_RULE = `JPG, PNG, atau PDF. Maksimal ${formatFileSize(UPLOAD_MAX_BYTES)}.`

type AmountChoice = "installment" | "payoff" | "custom"

const METHODS: readonly { readonly name: PaymentMethod; readonly note: string }[] = [
  { name: "Payment Gateway", note: "Midtrans, tercatat otomatis" },
  { name: "Bayar Cash", note: "Di kasir cabang, unggah bukti" },
]

function PendingNotice() {
  const pending = pendingTransactions(TRANSACTIONS)
  if (pending.length === 0) return null

  return (
    <Notice tone="warning">
      {pending
        .map(
          (t) =>
            `${installmentLabel(TRANSACTIONS.indexOf(t))} sebesar ${formatMoney(t.amount)} (${formatDate(t.date)}) masih menunggu verifikasi Finance.`,
        )
        .join(" ")}{" "}
      Pembayaran berikutnya tetap bisa dilakukan.
    </Notice>
  )
}

function DetailRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  const cls = strong ? "body" : "body-sm"
  return (
    <div className="row row-between">
      <span className={strong ? cls : `${cls} text-muted`}>{label}</span>
      <span className={`${cls} tabular`}>{value}</span>
    </div>
  )
}

export function PaymentPlanner() {
  const [choice, setChoice] = useState<AmountChoice>("installment")
  const [customAmount, setCustomAmount] = useState<number | string>("")
  const [method, setMethod] = useState<PaymentMethod>("Payment Gateway")
  const [proof, setProof] = useState<File | null>(null)
  const [reviewing, setReviewing] = useState(false)

  const installment = monthlyTarget()
  const remaining = shortfallAmount(TRANSACTIONS)
  const nextNumber = nextInstallmentNumber(TRANSACTIONS)

  const amount: Money =
    choice === "installment"
      ? installment
      : choice === "payoff"
        ? remaining
        : idr(Number(customAmount) || 0)

  const amountLabel =
    choice === "installment"
      ? `Angsuran ke-${nextNumber}`
      : choice === "payoff"
        ? "Lunasi seluruh sisa"
        : "Nominal lain"

  const fee = gatewayFee(method)
  const total = totalCharged(amount, method)

  const missing = [
    choice === "custom" && amount.amount <= 0 ? "isi nominalnya" : null,
    choice === "custom" && amount.amount > remaining.amount
      ? `nominal tidak boleh melebihi sisa ${formatMoney(remaining)}`
      : null,
    method === "Bayar Cash" && !proof ? "unggah bukti pembayaran" : null,
  ].filter((item): item is string => item !== null)

  const reset = () => {
    setChoice("installment")
    setCustomAmount("")
    setMethod("Payment Gateway")
    setProof(null)
    setReviewing(false)
  }

  return (
    <div className="grid-main-aside">
      <div className="stack stack-lg">
        <PendingNotice />

        <form
          className="card stack stack-lg"
          onSubmit={(event) => {
            event.preventDefault()
            setReviewing(true)
          }}
        >
          <Title order={2} size="h5">
            Bayar Sekarang
          </Title>

          <Stack gap="xs">
            <Text className="field-label" component="span">
              Pilih nominal
            </Text>

            <Radio.Group value={choice} onChange={(value) => setChoice(value as AmountChoice)}>
              <div className="stack stack-sm">
                <Radio.Card value="installment">
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                      <Radio.Indicator />
                      <span className="body">Angsuran ke-{nextNumber}</span>
                    </Group>
                    <span className="body tabular">{formatMoney(installment)}</span>
                  </Group>
                </Radio.Card>

                <Radio.Card value="payoff">
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                      <Radio.Indicator />
                      <span className="body">Lunasi seluruh sisa</span>
                    </Group>
                    <span className="body tabular">{formatMoney(remaining)}</span>
                  </Group>
                </Radio.Card>

                <Radio.Card value="custom">
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                      <Radio.Indicator />
                      <span className="body">Nominal lain</span>
                    </Group>
                    <span className="body-sm text-muted">Tentukan sendiri</span>
                  </Group>
                </Radio.Card>
              </div>
            </Radio.Group>

            {choice === "custom" && (
              <NumberInput
                name="nominal"
                hideControls
                aria-label="Nominal lain"
                placeholder="Contoh: 5.000.000"
                description={`Paling banyak ${formatMoney(remaining)}, sisa yang belum dibayar.`}
                prefix="Rp "
                thousandSeparator="."
                decimalSeparator=","
                min={0}
                max={remaining.amount}
                value={customAmount}
                onChange={setCustomAmount}
              />
            )}
          </Stack>

          <Stack gap="xs">
            <Text className="field-label" component="span">
              Metode pembayaran
            </Text>

            <Radio.Group value={method} onChange={(value) => setMethod(value as PaymentMethod)}>
              <div className="grid-2">
                {METHODS.map(({ name, note }) => (
                  <Radio.Card key={name} value={name}>
                    <Group gap="sm" wrap="nowrap" align="flex-start">
                      <Radio.Indicator />
                      <div className="stack stack-sm">
                        <span className="body">{name}</span>
                        <span className="caption text-muted">{note}</span>
                      </div>
                    </Group>
                  </Radio.Card>
                ))}
              </div>
            </Radio.Group>
          </Stack>

          {method === "Bayar Cash" && (
            <Stack gap="xs">
              <div className="stack" style={{ gap: 2 }}>
                <Text className="field-label" component="span">
                  Bukti pembayaran
                </Text>
                <span className="caption text-muted">
                  Pembayaran berstatus Menunggu sampai Finance memverifikasi buktinya.
                </span>
              </div>

              {proof ? (
                <div className="row-soft">
                  <div className="stack" style={{ gap: 0 }}>
                    <span className="body-sm">{proof.name}</span>
                    <span className="caption text-muted tabular">{formatFileSize(proof.size)}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setProof(null)}
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <Dropzone
                  onDrop={(files) => setProof(files[0] ?? null)}
                  onReject={() => notify.error(`Berkas ditolak. ${UPLOAD_RULE}`)}
                  maxSize={UPLOAD_MAX_BYTES}
                  maxFiles={1}
                  accept={[MIME_TYPES.jpeg, MIME_TYPES.png, MIME_TYPES.pdf]}
                >
                  <DropzoneBody rule={UPLOAD_RULE} />
                </Dropzone>
              )}
            </Stack>
          )}

          <div className="row row-between row-wrap" style={{ gap: 12 }}>
            <span className="caption text-muted" aria-live="polite">
              {missing.length > 0
                ? `Sebelum lanjut: ${missing.join(", ")}.`
                : `Bayar ${formatMoney(amount)} lewat ${method}. Invoice dikirim ke email.`}
            </span>
            <button type="submit" className="btn btn-primary" disabled={missing.length > 0}>
              Lanjutkan Pembayaran
            </button>
          </div>
        </form>
      </div>

      <div className="stack stack-lg">
        <section className="card stack">
          <Title order={2} size="h5">
            Yang Terbuka Setelah Bayar
          </Title>

          <p className="body-sm">{projectionSentence(TRANSACTIONS, amount)}</p>

          <div className="stack stack-sm">
            {unlockOutlook(TRANSACTIONS).map(({ label, unlocked }) => (
              <div key={label} className="row row-between">
                <span className="body-sm">{label}</span>
                <span className="badge badge-terbuka">{unlocked} dari 9 layanan</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Modal
        opened={reviewing}
        onClose={() => setReviewing(false)}
        title="Rincian Pembayaran"
        styles={{ title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }}
      >
        <Stack gap="md">
          <div className="stack stack-sm list-rows">
            <DetailRow label={amountLabel} value={formatMoney(amount)} />
            <DetailRow label="Metode" value={method} />
            {fee.amount > 0 && (
              <DetailRow label="Biaya layanan Midtrans" value={formatMoney(fee)} />
            )}
            {proof && <DetailRow label="Bukti pembayaran" value={proof.name} />}
            <DetailRow label="Total dibayar" value={formatMoney(total)} strong />
          </div>

          <Text size="sm" c="dimmed">
            {method === "Payment Gateway"
              ? "Biaya layanan masuk ke Midtrans, tidak dihitung sebagai pembayaran paket. Invoice dikirim ke email."
              : "Status Menunggu sampai Finance memverifikasi bukti pembayaran. Invoice dikirim ke email."}
          </Text>

          <Group justify="flex-end">
            <button type="button" className="btn btn-secondary" onClick={() => setReviewing(false)}>
              Batal
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                notify.success(
                  `Pembayaran ${formatMoney(total)} lewat ${method} diteruskan. Invoice dikirim ke email.`,
                )
                reset()
              }}
            >
              Bayar {formatMoney(total)}
            </button>
          </Group>
        </Stack>
      </Modal>
    </div>
  )
}
