"use client"

import { NumberInput, Textarea } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import { schemaResolver, useForm } from "@mantine/form"
import { useState } from "react"

import { FormModal } from "@/src/components/ui/FormModal"
import { Notice } from "@/src/components/ui/Notice"
import { assessFinance } from "@/src/entities/leave/actions"
import { type LeaveDetail, obligationFormSchema } from "@/src/entities/leave/schema"
import { formatMoney, idr } from "@/src/lib/money"
import { useActionForm } from "@/src/lib/use-action-form"

import { Field, Panel } from "./LeavePanels"
import { RejectModal } from "./RejectModal"

type Dialog = "obligation" | "sufficient" | "reject" | null

type ObligationValues = { amountIdr: number | string; deadline: string | null; note: string }

function FinanceFigures({ leave }: { leave: LeaveDetail }) {
  const { paidIdr, minimumIdr } = leave.finance
  return (
    <div className="grid-3">
      <Field label="Siswa" value={`${leave.student.name} · ${leave.student.nis ?? "-"}`} />
      <Field label="Total Pembayaran" value={formatMoney(idr(paidIdr))} />
      <Field label="Cicilan Minimum" value={formatMoney(idr(minimumIdr))} />
    </div>
  )
}

function ObligationModal({
  leave,
  note,
  onClose,
}: {
  leave: LeaveDetail
  note: string
  onClose: () => void
}) {
  const shortfall = leave.finance.shortfallIdr
  const form = useForm<ObligationValues>({
    initialValues: { amountIdr: shortfall > 0 ? shortfall : "", deadline: null, note },
    validate: schemaResolver(obligationFormSchema, { sync: true }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) =>
      assessFinance(leave.id, {
        decision: "set-obligation",
        ...obligationFormSchema.parse(values),
      }),
    successMessage: `Kewajiban dikirim ke ${leave.student.name}. Pengajuan pindah ke Menunggu Pembayaran.`,
    invalidates: [["leaves"]],
    onSuccess: onClose,
  })

  return (
    <FormModal
      title="Tetapkan Kewajiban Pembayaran"
      size="lg"
      submitLabel="Konfirmasi & Kirim"
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <span className="body-sm text-muted">
        Siswa melihat nominal dan batas waktunya di portal, lalu membayar lewat halaman Pembayaran
        portal.
      </span>
      <FinanceFigures leave={leave} />
      <div className="grid-2">
        <NumberInput
          label="Selisih yang ditagih"
          description={`Selisih terhitung ${formatMoney(idr(shortfall))}.`}
          prefix="Rp "
          thousandSeparator="."
          decimalSeparator=","
          hideControls
          min={1}
          allowDecimal={false}
          withAsterisk
          {...form.getInputProps("amountIdr")}
        />
        <DatesProvider settings={{ locale: "id" }}>
          <DateInput
            label="Batas Pembayaran"
            description="Berlaku sampai pukul 23.59 WIB. Lewat itu pengajuan gugur."
            placeholder="Pilih tanggal"
            valueFormat="DD MMMM YYYY"
            minDate={new Date()}
            withAsterisk
            {...form.getInputProps("deadline")}
          />
        </DatesProvider>
      </div>
      <Textarea
        label="Catatan Finance"
        description="Ikut terkirim ke siswa bersama kewajibannya."
        autosize
        minRows={2}
        withAsterisk
        {...form.getInputProps("note")}
      />
    </FormModal>
  )
}

function SufficientModal({
  leave,
  note,
  onClose,
}: {
  leave: LeaveDetail
  note: string
  onClose: () => void
}) {
  const form = useForm({ initialValues: {} })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: () =>
      assessFinance(leave.id, { decision: "sufficient", note: note.trim() || undefined }),
    successMessage: `${leave.student.name} diteruskan ke Persetujuan Akhir tanpa tagihan tambahan.`,
    invalidates: [["leaves"]],
    onSuccess: onClose,
  })
  const shortfall = leave.finance.shortfallIdr

  return (
    <FormModal
      title="Pembayaran Sudah Mencukupi"
      submitLabel="Setujui Verifikasi Finance"
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <FinanceFigures leave={leave} />
      <Notice tone={shortfall === 0 ? "success" : "warning"}>
        {shortfall === 0
          ? "Siswa tidak perlu menyetor tambahan. Pengajuan melompati tahap pembayaran dan diteruskan ke Persetujuan Akhir."
          : `Selisih terhitung masih ${formatMoney(idr(shortfall))}. Meneruskan berarti Finance menanggung selisihnya sebagai kebijakan.`}
      </Notice>
    </FormModal>
  )
}

export function FinanceReview({ leave, canDecide }: { leave: LeaveDetail; canDecide: boolean }) {
  const [dialog, setDialog] = useState<Dialog>(null)
  const [note, setNote] = useState(leave.finance.note ?? "")
  const { paidIdr, minimumIdr, shortfallIdr } = leave.finance
  const close = () => setDialog(null)

  return (
    <>
      <Panel title="Penilaian Pembayaran">
        <div className="grid-3">
          <Field label="Total Pembayaran" value={formatMoney(idr(paidIdr))} />
          <Field label="Cicilan Minimum sebelum cuti" value={formatMoney(idr(minimumIdr))} />
          <div className="stack" style={{ gap: 2 }}>
            <span className="caption text-muted">Selisih / Kekurangan</span>
            <span className={`h5 tabular ${shortfallIdr > 0 ? "text-danger" : "text-success"}`}>
              {shortfallIdr > 0 ? formatMoney(idr(shortfallIdr)) : "Mencukupi"}
            </span>
          </div>
        </div>
        {canDecide ? (
          <>
            <Textarea
              label="Catatan Finance"
              description="Ikut terkirim ke siswa bersama kewajibannya. Cara membayar sudah ada di halaman Pembayaran portal, tulis di sini hanya yang khusus untuk pengajuan ini."
              placeholder="Contoh: pembayaran belum mencapai cicilan minimum sebelum cuti."
              autosize
              minRows={3}
              value={note}
              onChange={(event) => setNote(event.currentTarget.value)}
            />
            <div className="row row-wrap" style={{ gap: 8 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setDialog("obligation")}
              >
                Tetapkan Kewajiban Pembayaran
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDialog("sufficient")}
              >
                Pembayaran Sudah Mencukupi
              </button>
              <button type="button" className="btn btn-danger" onClick={() => setDialog("reject")}>
                Tolak
              </button>
            </div>
            <span className="caption text-muted">
              Ada kekurangan: tetapkan kewajiban. Sudah cukup: teruskan ke Persetujuan Akhir.
            </span>
          </>
        ) : (
          <span className="caption text-muted">
            Keputusan tahap ini dikerjakan Staf Finance atau Manajer Finance.
          </span>
        )}
      </Panel>

      {dialog === "obligation" && <ObligationModal leave={leave} note={note} onClose={close} />}
      {dialog === "sufficient" && <SufficientModal leave={leave} note={note} onClose={close} />}
      {dialog === "reject" && (
        <RejectModal
          leave={leave}
          reject={(values) => assessFinance(leave.id, { decision: "reject", ...values })}
          onClose={close}
        />
      )}
    </>
  )
}
