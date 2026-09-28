"use client"

import { Modal, NumberInput, Select, Textarea, TextInput } from "@mantine/core"
import { DateInput } from "@mantine/dates"
import { Dropzone } from "@mantine/dropzone"
import { schemaResolver, useForm } from "@mantine/form"
import { useDebouncedValue } from "@mantine/hooks"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { DropzoneBody } from "@/src/components/ui/DropzoneBody"
import { Notice } from "@/src/components/ui/Notice"
import { presignPaymentProof, recordCashPayment } from "@/src/entities/payment/actions"
import { PAYMENT_KEYS, paymentStudentsQuery } from "@/src/entities/payment/queries"
import {
  CASH_KINDS,
  cashFormSchema,
  paymentInputOf,
  type CashForm,
  type CashKind,
  type PaymentStudentOption,
} from "@/src/entities/payment/schema"
import { branchesQuery } from "@/src/entities/user/queries"
import { failureOf } from "@/src/lib/api/errors"
import { readApi } from "@/src/lib/api/read"
import { useRead } from "@/src/lib/api/use-read"
import { formatFileSize } from "@/src/lib/format"
import { SEARCH_DELAY_MS } from "@/src/lib/list-query"
import {
  isUploadable,
  putToStorage,
  UPLOAD_ACCEPT,
  UPLOAD_FAILED,
  UPLOAD_RULE,
} from "@/src/lib/upload"
import { useActionForm } from "@/src/lib/use-action-form"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }
const MIN_SEARCH = 2
const PROOF_REQUIRED = "Unggah bukti pembayarannya."
const NO_EURO_FEE = "Paket siswa ini tidak punya Harga Layanan Euro."
const NO_BRIDGING_FUND = "Paket siswa ini tidak memakai Dana Talang."

const todayInJakarta = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })

function kindBlockOf(kind: CashKind, student: PaymentStudentOption | null): string | null {
  if (!student) return null
  if (kind === "Euro" && !student.hasServiceFeeEur) return NO_EURO_FEE
  if (kind === "Dana Talang" && !student.bridgingFundIdr && !student.bridgingFundEur) {
    return NO_BRIDGING_FUND
  }
  return null
}

function bridgingOptionsOf(student: PaymentStudentOption | null) {
  return [
    { value: "IDR", label: "Rupiah (Dana Talang Indonesia)", disabled: !student?.bridgingFundIdr },
    { value: "EUR", label: "Euro (Dana Talang Jerman)", disabled: !student?.bridgingFundEur },
  ]
}

export function CashPaymentModal({ onClose }: { onClose: () => void }) {
  const [idempotencyKey] = useState(() => crypto.randomUUID())
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebouncedValue(search.trim(), SEARCH_DELAY_MS)
  const [student, setStudent] = useState<PaymentStudentOption | null>(null)
  const [proof, setProof] = useState<File | null>(null)
  const [proofError, setProofError] = useState<string | null>(null)

  const studentRead = paymentStudentsQuery(debouncedSearch)
  const students = useQuery({
    queryKey: studentRead.queryKey,
    queryFn: () => readApi(studentRead),
    enabled: debouncedSearch.length >= MIN_SEARCH,
  })
  const branches = useRead(branchesQuery())
  const options = [
    ...(student ? [student] : []),
    ...(students.data?.data ?? []).filter((option) => option.id !== student?.id),
  ]

  const form = useForm<CashForm>({
    initialValues: {
      studentId: "",
      paidOn: todayInJakarta(),
      cashKind: null,
      bridgingCurrency: null,
      amount: "",
      receivedByName: "",
      branchId: "",
      note: "",
    },
    validate: schemaResolver(cashFormSchema, { sync: true }),
  })
  const { cashKind } = form.values
  const isEuro =
    cashKind === "Euro" || (cashKind === "Dana Talang" && form.values.bridgingCurrency === "EUR")

  const { submit, isPending, formError } = useActionForm({
    form,
    action: async (values) => {
      if (!proof) return failureOf<null>(PROOF_REQUIRED)
      if (values.cashKind === "Dana Talang" && !values.bridgingCurrency) {
        return failureOf<null>("Pilih mata uang Dana Talang.", "bridgingCurrency")
      }
      const target = await presignPaymentProof(values.studentId, {
        mimeType: proof.type,
        sizeBytes: proof.size,
      })
      if (!target.ok) return target
      if (!(await putToStorage(target.data, proof))) return failureOf<null>(UPLOAD_FAILED)
      const saved = await recordCashPayment(
        {
          studentId: values.studentId,
          paidOn: values.paidOn,
          ...paymentInputOf(values),
          receivedByName: values.receivedByName.trim(),
          branchId: values.branchId,
          note: values.note.trim() || null,
          proofId: target.data.proofId,
        },
        idempotencyKey,
      )
      if (!saved.ok && saved.fieldErrors.currency) {
        return { ...saved, fieldErrors: { cashKind: saved.fieldErrors.currency } }
      }
      return saved
    },
    successMessage: `Pembayaran ${student?.name ?? ""} dicatat, menunggu pengesahan Manajer Finance.`,
    invalidates: PAYMENT_KEYS,
    onSuccess: onClose,
  })

  const missing = [
    form.values.studentId ? null : "pilih siswa",
    cashKind ? null : "pilih jenis",
    Number(form.values.amount) > 0 ? null : "isi nominal",
    proof ? null : "unggah bukti pembayaran",
  ].filter((item): item is string => item !== null)

  function pickStudent(value: string | null) {
    const picked = options.find((option) => option.id === value) ?? null
    setStudent(picked)
    form.setValues({
      studentId: picked?.id ?? "",
      branchId: picked?.branch.id ?? form.values.branchId,
      cashKind: null,
      bridgingCurrency: null,
    })
  }

  function pickKind(value: string | null) {
    const kind = CASH_KINDS.find((option) => option === value) ?? null
    const bridging = bridgingOptionsOf(student).filter((option) => !option.disabled)
    form.setValues({
      cashKind: kind,
      bridgingCurrency:
        kind === "Dana Talang" && bridging.length === 1
          ? (bridging[0]?.value as "IDR" | "EUR")
          : null,
    })
  }

  function pickProof(files: File[]) {
    const picked = files[0]
    if (!picked) return
    if (!isUploadable(picked)) {
      setProofError(UPLOAD_RULE)
      return
    }
    setProofError(null)
    setProof(picked)
  }

  const branchOptions = (branches.data?.data ?? [])
    .filter((branch) => branch.status === "Aktif" || branch.id === form.values.branchId)
    .map((branch) => ({ value: branch.id, label: branch.name }))

  return (
    <Modal opened onClose={onClose} title="Catat Pembayaran Tunai" size="lg" styles={TITLE_STYLE}>
      <form
        className="stack"
        noValidate
        onSubmit={(event) => {
          if (!proof) setProofError(PROOF_REQUIRED)
          submit(event)
        }}
      >
        {formError && <Notice tone="danger">{formError}</Notice>}

        <Select
          label="Siswa"
          placeholder="Cari nama siswa..."
          withAsterisk
          searchable
          data-autofocus
          searchValue={search}
          onSearchChange={setSearch}
          filter={({ options: all }) => all}
          nothingFoundMessage={
            debouncedSearch.length < MIN_SEARCH
              ? "Ketik minimal dua huruf nama atau NIS."
              : students.isFetching
                ? "Mencari..."
                : students.isError
                  ? students.error.message
                  : "Tidak ada siswa berkontrak aktif yang cocok dalam cakupanmu."
          }
          data={options.map((option) => ({
            value: option.id,
            label: `${option.name} · ${option.nis ?? "Belum ber-NIS"}`,
          }))}
          value={form.values.studentId || null}
          error={form.errors.studentId}
          onChange={pickStudent}
        />

        <DateInput
          label="Tanggal Pembayaran"
          placeholder="dd/mm/yyyy"
          valueFormat="DD/MM/YYYY"
          maxDate={todayInJakarta()}
          withAsterisk
          value={form.values.paidOn || null}
          error={form.errors.paidOn}
          onChange={(value) => form.setFieldValue("paidOn", value ?? "")}
        />

        <Select
          label="Jenis"
          placeholder="Rupiah / Euro / Dana Talang"
          description={
            student
              ? "Rupiah untuk tunai di kasir yang dicatat admin; Bayar Cash dari portal masuk sendiri."
              : "Pilih siswa dulu. Jenis yang boleh dipilih mengikuti paket siswa itu."
          }
          withAsterisk
          disabled={!student}
          data={CASH_KINDS.map((kind) => {
            const block = kindBlockOf(kind, student)
            return { value: kind, label: block ? `${kind} (${block})` : kind, disabled: !!block }
          })}
          value={cashKind}
          error={form.errors.cashKind}
          onChange={pickKind}
        />

        {cashKind === "Dana Talang" && (
          <Select
            label="Mata Uang Dana Talang"
            placeholder="Rupiah / Euro"
            description="Hanya yang benderanya menyala di paket siswa ini."
            withAsterisk
            data={bridgingOptionsOf(student)}
            {...form.getInputProps("bridgingCurrency")}
          />
        )}

        <NumberInput
          label="Nominal"
          placeholder={isEuro ? "800" : "10.000.000"}
          prefix={isEuro ? "€ " : "Rp "}
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={isEuro ? 2 : 0}
          allowNegative={false}
          hideControls
          withAsterisk
          {...form.getInputProps("amount")}
        />

        <TextInput
          label="Penerima"
          placeholder="Nama penerima"
          description="Nama kasir yang menerima uang."
          withAsterisk
          {...form.getInputProps("receivedByName")}
        />

        <Select
          label="Cabang"
          placeholder={branches.isPending ? "Memuat cabang..." : "Pilih cabang"}
          withAsterisk
          data={branchOptions}
          error={form.errors.branchId ?? (branches.isError ? branches.error.message : undefined)}
          value={form.values.branchId || null}
          onChange={(value) => form.setFieldValue("branchId", value ?? "")}
        />

        <Textarea
          label="Catatan / Keterangan"
          placeholder="Tambahkan catatan atau keterangan pembayaran"
          autosize
          minRows={2}
          {...form.getInputProps("note")}
        />

        <div className="stack" style={{ gap: 6 }}>
          <span className="field-label">Bukti Pembayaran</span>
          {proof ? (
            <div className="row-soft">
              <div className="stack" style={{ gap: 0 }}>
                <span className="body-sm">{proof.name}</span>
                <span className="caption text-muted tabular">{formatFileSize(proof.size)}</span>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setProof(null)}>
                Hapus
              </button>
            </div>
          ) : (
            <Dropzone
              onDrop={pickProof}
              onReject={() => setProofError(UPLOAD_RULE)}
              maxFiles={1}
              multiple={false}
              accept={UPLOAD_ACCEPT.split(",")}
            >
              <DropzoneBody rule={UPLOAD_RULE} />
            </Dropzone>
          )}
          {proofError && <span className="field-error">{proofError}</span>}
        </div>

        <span className="caption text-muted" aria-live="polite">
          {missing.length > 0
            ? `Sebelum simpan: ${missing.join(", ")}.`
            : "Berstatus Menunggu sampai Manajer Finance mengesahkannya."}
        </span>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={missing.length > 0 || isPending}
        >
          {isPending ? "Menyimpan..." : "Simpan Pembayaran"}
        </button>
      </form>
    </Modal>
  )
}
