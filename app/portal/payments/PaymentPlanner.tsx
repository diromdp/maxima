"use client"

import { Group, Modal, NumberInput, Radio, Skeleton, Stack, Text, Title } from "@mantine/core"
import { Dropzone } from "@mantine/dropzone"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Script from "next/script"
import { useState } from "react"

import { DropzoneBody } from "@/src/components/ui/DropzoneBody"
import { Notice } from "@/src/components/ui/Notice"
import { openCheckout, presignOwnProof, submitCashPayment } from "@/src/entities/portal/actions"
import {
  nextPaymentLabelOf,
  type Checkout,
  type PortalPayments,
} from "@/src/entities/portal/schema"
import { type ActionResult, failureOf } from "@/src/lib/api/errors"
import { env } from "@/src/lib/env"
import { formatFileSize } from "@/src/lib/format"
import { formatMoney, idr } from "@/src/lib/money"
import { notify } from "@/src/lib/notify"
import {
  isUploadable,
  putToStorage,
  UPLOAD_FAILED,
  UPLOAD_MAX_BYTES,
  UPLOAD_RULE,
  UPLOAD_TYPES,
} from "@/src/lib/upload"

type AmountChoice = "leave" | "installment" | "payoff" | "custom"
type Method = "Payment Gateway" | "Bayar Cash"

export type LeaveDue = { readonly number: string; readonly amountIdr: number }

type SnapResult = { status_message?: string }

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks: {
          onSuccess: (result: SnapResult) => void
          onPending: (result: SnapResult) => void
          onError: (result: SnapResult) => void
          onClose: () => void
        },
      ) => void
    }
  }
}

const SNAP_URL = env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION
  ? "https://app.midtrans.com/snap/snap.js"
  : "https://app.sandbox.midtrans.com/snap/snap.js"

const METHODS: readonly { readonly name: Method; readonly note: string }[] = [
  { name: "Payment Gateway", note: "Bayar online, tercatat otomatis" },
  { name: "Bayar Cash", note: "Di kasir cabang, unggah bukti" },
]

const PAYMENT_KEYS = [["portal-payments"], ["portal-dashboard"]] as const

const rupiah = (amount: number) => formatMoney(idr(amount))

async function sendCash(
  amountIdr: number,
  proof: File,
  idempotencyKey: string,
): Promise<ActionResult> {
  if (!isUploadable(proof)) return failureOf(UPLOAD_RULE)
  const presigned = await presignOwnProof({ mimeType: proof.type, sizeBytes: proof.size })
  if (!presigned.ok) return presigned
  if (!(await putToStorage(presigned.data, proof))) return failureOf(UPLOAD_FAILED)
  return submitCashPayment(amountIdr, presigned.data.proofId, idempotencyKey)
}

function DetailRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  const size = strong ? "body" : "body-sm"
  return (
    <div className="row row-between">
      <span className={strong ? size : `${size} text-muted`}>{label}</span>
      <span className={`${size} tabular`}>{value}</span>
    </div>
  )
}

function ReviewSkeleton() {
  return (
    <div className="stack stack-sm" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} height={20} radius="xl" aria-hidden />
      ))}
    </div>
  )
}

export function PaymentPlanner({
  payments,
  leaveDue = null,
}: {
  payments: PortalPayments
  leaveDue?: LeaveDue | null
}) {
  const queryClient = useQueryClient()
  const remaining = payments.totals.remainingIdr
  const installment = payments.nextInstallment
  const installmentAmount = installment?.amountIdr ?? null
  const leaveAmount = leaveDue ? Math.min(leaveDue.amountIdr, remaining) : null
  const defaultChoice: AmountChoice =
    leaveDue !== null ? "leave" : installmentAmount === null ? "payoff" : "installment"

  const [choice, setChoice] = useState<AmountChoice>(defaultChoice)
  const [customAmount, setCustomAmount] = useState<number | string>("")
  const [method, setMethod] = useState<Method>("Payment Gateway")
  const [proof, setProof] = useState<File | null>(null)
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPaying, setIsPaying] = useState(false)

  const checkout = useMutation({
    mutationFn: ({ amountIdr, key }: { amountIdr: number; key: string }) =>
      openCheckout(amountIdr, key),
  })
  const cash = useMutation({
    mutationFn: ({ amountIdr, file, key }: { amountIdr: number; file: File; key: string }) =>
      sendCash(amountIdr, file, key),
  })

  const amountIdr =
    choice === "leave"
      ? (leaveAmount ?? 0)
      : choice === "installment"
        ? (installmentAmount ?? 0)
        : choice === "payoff"
          ? remaining
          : Number(customAmount) || 0

  const amountLabel =
    choice === "leave"
      ? `Syarat cuti ${leaveDue?.number ?? ""}`
      : choice === "installment"
        ? installment
          ? nextPaymentLabelOf(installment)
          : ""
        : choice === "payoff"
          ? "Lunasi seluruh sisa"
          : "Nominal lain"

  const missing = [
    choice === "custom" && amountIdr <= 0 ? "isi nominalnya" : null,
    choice === "custom" && amountIdr > remaining
      ? `nominal tidak boleh melebihi sisa ${rupiah(remaining)}`
      : null,
    method === "Bayar Cash" && !proof ? "unggah bukti pembayaran" : null,
  ].filter((item): item is string => item !== null)

  const opened = idempotencyKey !== null
  const order: Checkout | null = checkout.data?.ok ? checkout.data.data : null

  function reset() {
    setChoice(defaultChoice)
    setCustomAmount("")
    setMethod("Payment Gateway")
    setProof(null)
    closeReview()
  }

  function closeReview() {
    setIdempotencyKey(null)
    setError(null)
    checkout.reset()
  }

  async function refresh() {
    await Promise.all(PAYMENT_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
  }

  async function requestCheckout(key: string) {
    setError(null)
    const result = await checkout.mutateAsync({ amountIdr, key })
    if (!result.ok) setError(result.message)
  }

  function review() {
    const key = crypto.randomUUID()
    setIdempotencyKey(key)
    setError(null)
    if (method === "Payment Gateway") void requestCheckout(key)
  }

  function payWithSnap(token: string) {
    if (!window.snap) {
      setError("Halaman pembayaran belum termuat. Muat ulang halaman lalu coba lagi.")
      return
    }
    setIsPaying(true)
    window.snap.pay(token, {
      onSuccess: () => {
        setIsPaying(false)
        notify.success("Pembayaran diterima. Statusnya tercatat begitu pembayaran terkonfirmasi.")
        reset()
        void refresh()
      },
      onPending: () => {
        setIsPaying(false)
        notify.success(
          "Selesaikan pembayaran sesuai petunjuk di jendela pembayaran. Statusnya tercatat otomatis.",
        )
        reset()
        void refresh()
      },
      onError: (result) => {
        setIsPaying(false)
        setError(result.status_message ?? "Pembayaran gagal. Coba lagi atau pilih Bayar Cash.")
      },
      onClose: () => setIsPaying(false),
    })
  }

  async function payCash(key: string) {
    if (!proof) return
    setError(null)
    const result = await cash.mutateAsync({ amountIdr, file: proof, key })
    if (!result.ok) return setError(result.message)
    notify.success("Bukti Bayar Cash terkirim. Statusnya Menunggu sampai Finance memverifikasinya.")
    reset()
    await refresh()
  }

  if (remaining <= 0) {
    return (
      <section className="card stack">
        <Title order={2} size="h5">
          Bayar Sekarang
        </Title>
        <Notice tone="success">Pembayaran Rupiah paket Anda sudah lunas.</Notice>
      </section>
    )
  }

  const isSubmitting = cash.isPending || isPaying

  return (
    <>
      <Script src={SNAP_URL} data-client-key={env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} />

      <form
        className="card stack stack-lg"
        onSubmit={(event) => {
          event.preventDefault()
          review()
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
              {leaveDue && leaveAmount !== null && (
                <Radio.Card value="leave">
                  <Group justify="space-between" wrap="nowrap" align="flex-start">
                    <Group gap="sm" wrap="nowrap" align="flex-start">
                      <Radio.Indicator />
                      <div className="stack stack-sm">
                        <span className="body">Syarat pengajuan cuti {leaveDue.number}</span>
                        <span className="caption text-muted">
                          Nominal yang ditetapkan Finance. Pengajuan cuti Anda maju sendiri begitu
                          pembayarannya berlaku (Bayar Cash setelah disahkan Finance), tanpa unggah
                          bukti.
                        </span>
                      </div>
                    </Group>
                    <span className="body tabular">{rupiah(leaveAmount)}</span>
                  </Group>
                </Radio.Card>
              )}

              {installment && installmentAmount !== null && (
                <Radio.Card value="installment">
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                      <Radio.Indicator />
                      <span className="body">{nextPaymentLabelOf(installment)}</span>
                    </Group>
                    <span className="body tabular">{rupiah(installmentAmount)}</span>
                  </Group>
                </Radio.Card>
              )}

              <Radio.Card value="payoff">
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap">
                    <Radio.Indicator />
                    <span className="body">Lunasi seluruh sisa</span>
                  </Group>
                  <span className="body tabular">{rupiah(remaining)}</span>
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
              description={`Paling banyak ${rupiah(remaining)}, sisa yang belum dibayar.`}
              prefix="Rp "
              thousandSeparator="."
              decimalSeparator=","
              allowDecimal={false}
              min={0}
              max={remaining}
              value={customAmount}
              onChange={setCustomAmount}
            />
          )}
        </Stack>

        <Stack gap="xs">
          <Text className="field-label" component="span">
            Metode pembayaran
          </Text>

          <Radio.Group value={method} onChange={(value) => setMethod(value as Method)}>
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
                onReject={() => notify.error(UPLOAD_RULE)}
                maxSize={UPLOAD_MAX_BYTES}
                maxFiles={1}
                accept={[...UPLOAD_TYPES]}
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
              : "Invoice dikirim otomatis ke email."}
          </span>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={missing.length > 0}
            title={missing.length > 0 ? `Sebelum lanjut: ${missing.join(", ")}.` : undefined}
          >
            Lanjutkan Pembayaran
          </button>
        </div>
      </form>

      <Modal
        opened={opened}
        onClose={() => !isSubmitting && closeReview()}
        title="Rincian Pembayaran"
        styles={{ title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }}
      >
        <Stack gap="md">
          {error && <Notice tone="danger">{error}</Notice>}

          {method === "Payment Gateway" ? (
            checkout.isPending ? (
              <ReviewSkeleton />
            ) : (
              order && (
                <div className="stack stack-sm list-rows">
                  <DetailRow label={amountLabel} value={rupiah(order.amountIdr)} />
                  <DetailRow label="Metode" value={method} />
                  <DetailRow label="Biaya layanan" value={rupiah(order.feeIdr)} />
                  <DetailRow label="Total dibayar" value={rupiah(order.totalIdr)} strong />
                </div>
              )
            )
          ) : (
            <div className="stack stack-sm list-rows">
              <DetailRow label={amountLabel} value={rupiah(amountIdr)} />
              <DetailRow label="Metode" value={method} />
              {proof && <DetailRow label="Bukti pembayaran" value={proof.name} />}
              <DetailRow label="Total dibayar" value={rupiah(amountIdr)} strong />
            </div>
          )}

          <Text size="sm" c="dimmed">
            {method === "Payment Gateway"
              ? "Biaya layanan dibayar ke penyedia pembayaran, tidak dihitung sebagai pembayaran paket. Invoice dikirim ke email."
              : "Status Menunggu sampai Finance memverifikasi bukti pembayaran. Invoice dikirim ke email."}
          </Text>

          <Group justify="flex-end">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={isSubmitting}
              onClick={closeReview}
            >
              Batal
            </button>
            {method === "Payment Gateway" ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={checkout.isPending || isPaying}
                onClick={() =>
                  order
                    ? payWithSnap(order.snapToken)
                    : idempotencyKey && void requestCheckout(idempotencyKey)
                }
              >
                {order
                  ? `Bayar ${rupiah(order.totalIdr)}`
                  : checkout.isPending
                    ? "Bayar"
                    : "Coba lagi"}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                disabled={isSubmitting}
                onClick={() => idempotencyKey && void payCash(idempotencyKey)}
              >
                {cash.isPending ? "Mengirim..." : `Bayar ${rupiah(amountIdr)}`}
              </button>
            )}
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
