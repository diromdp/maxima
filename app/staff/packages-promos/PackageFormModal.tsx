"use client"

import { Checkbox, MultiSelect, NumberInput, Select, TextInput } from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"
import { useState } from "react"

import { FormModal } from "@/src/components/ui/FormModal"
import { Notice } from "@/src/components/ui/Notice"
import { MASTER_STATUSES, type MasterItemRow } from "@/src/entities/master-data/schema"
import { previewPackageGates, savePackage } from "@/src/entities/package/actions"
import { monthlyInstallmentOf } from "@/src/entities/package/compute"
import {
  CENTS_PER_EURO,
  DOWN_PAYMENT_GATE,
  type GatePreview,
  packageFormSchema,
  type PackageForm,
  type PackageView,
} from "@/src/entities/package/schema"
import { notify } from "@/src/lib/notify"
import { useActionForm } from "@/src/lib/use-action-form"

const RUPIAH = { prefix: "Rp ", thousandSeparator: ".", decimalSeparator: ",", hideControls: true }

const validatePackage = schemaResolver(packageFormSchema, { sync: true })

const blankOr = (value: number | null): number | "" => value ?? ""

function formOf(initial: PackageView | undefined, gates: readonly MasterItemRow[]): PackageForm {
  const thresholdOf = new Map(initial?.gates.map((gate) => [gate.id, gate.thresholdIdr]))
  return {
    code: initial?.code ?? "",
    name: initial?.name ?? "",
    programId: initial?.program.id ?? "",
    priceIdr: blankOr(initial?.priceIdr ?? null),
    serviceFeeEur:
      initial && initial.serviceFeeEurCents !== null
        ? initial.serviceFeeEurCents / CENTS_PER_EURO
        : "",
    durationMonths: blankOr(initial?.durationMonths ?? null),
    monthlyIdr: blankOr(initial?.monthlyIdr ?? null),
    billingDay: blankOr(initial?.billingDay ?? null),
    bridgingFundIdr: initial?.bridgingFundIdr ?? false,
    bridgingFundEur: initial?.bridgingFundEur ?? false,
    status: initial?.status ?? "Aktif",
    levelIds: initial?.levels.map((level) => level.id) ?? [],
    gates: Object.fromEntries(
      gates.map((gate) => [gate.id, blankOr(thresholdOf.get(gate.id) ?? null)]),
    ),
  }
}

const optionsOf = (items: readonly MasterItemRow[], keep: readonly string[]) =>
  items
    .filter((item) => item.status === "Aktif" || keep.includes(item.id))
    .map((item) => ({ value: item.id, label: item.name }))

export function PackageFormModal({
  initial,
  masterItems,
  onClose,
}: {
  initial: PackageView | undefined
  masterItems: readonly MasterItemRow[]
  onClose: () => void
}) {
  const gates = masterItems.filter((item) => item.type === "gate")
  const levels = masterItems.filter((item) => item.type === "level")
  const programs = masterItems.filter((item) => item.type === "program")
  const dpGate = gates.find((gate) => gate.code === DOWN_PAYMENT_GATE)
  const isCodeLocked = (initial?.contractCount ?? 0) > 0

  const [impact, setImpact] = useState<GatePreview | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const form = useForm<PackageForm>({
    initialValues: formOf(initial, gates),
    validate: (values) => ({
      ...validatePackage(values),
      ...(dpGate && values.gates[dpGate.id] === ""
        ? {
            [`gates.${dpGate.id}`]: `${dpGate.name} tidak boleh kosong karena ia yang menerbitkan NIS. Isi 0 bila NIS terbit tanpa DP.`,
          }
        : {}),
    }),
    onValuesChange: (values, previous) => {
      setImpact(null)
      const dpOf = (formValues: PackageForm) => (dpGate ? (formValues.gates[dpGate.id] ?? "") : "")
      const isTermsChanged =
        values.priceIdr !== previous.priceIdr ||
        values.durationMonths !== previous.durationMonths ||
        dpOf(values) !== dpOf(previous)
      if (!isTermsChanged) return
      const monthlyIdr = monthlyInstallmentOf(values.priceIdr, dpOf(values), values.durationMonths)
      if (monthlyIdr !== values.monthlyIdr) form.setFieldValue("monthlyIdr", monthlyIdr)
    },
  })

  const levelOrder = new Map(levels.map((level, index) => [level.id, index]))
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) =>
      savePackage(
        initial ? { id: initial.id, code: initial.code } : null,
        {
          ...values,
          levelIds: [...values.levelIds].sort(
            (a, b) => (levelOrder.get(a) ?? 0) - (levelOrder.get(b) ?? 0),
          ),
        },
        dpGate?.id ?? "",
      ),
    successMessage: initial
      ? `Perubahan ${initial.name} disimpan dan dicatat di log aktivitas.`
      : "Paket baru disimpan dan dicatat di log aktivitas.",
    invalidates: [["packages"], ["promos"]],
    onSuccess: onClose,
  })

  const handleSubmit = form.onSubmit(async (values) => {
    if (initial && impact === null) {
      setIsChecking(true)
      const preview = await previewPackageGates(initial.id, values.gates)
      setIsChecking(false)
      if (!preview.ok) {
        if (Object.keys(preview.fieldErrors).length > 0) form.setErrors(preview.fieldErrors)
        else notify.error(preview.message)
        return
      }
      if (preview.data.changes.length > 0 && preview.data.affectedContracts > 0) {
        setImpact(preview.data)
        return
      }
    }
    submit()
  })

  return (
    <FormModal
      title={initial ? `Ubah ${initial.name}` : "Tambah Paket"}
      size="lg"
      submitLabel={
        impact
          ? `Simpan dan Terapkan ke ${impact.affectedContracts} Kontrak`
          : initial
            ? "Simpan Perubahan"
            : "Simpan Paket"
      }
      formError={formError}
      isPending={isPending || isChecking}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <div className="grid-2">
        <TextInput
          label="Nama Paket"
          placeholder="Ausbildung 45"
          withAsterisk
          data-autofocus
          {...form.getInputProps("name")}
        />
        <TextInput
          label="Kode Paket"
          placeholder="Dibuat dari nama bila kosong"
          description={
            isCodeLocked
              ? `Dipakai ${initial?.contractCount} kontrak, jadi kodenya tetap. Ganti namanya saja.`
              : "Kunci templat impor. Huruf kecil, angka, dan tanda hubung."
          }
          disabled={isCodeLocked}
          {...form.getInputProps("code")}
        />
      </div>

      <div className="grid-2">
        <Select
          label="Program"
          placeholder="Pilih program"
          data={optionsOf(programs, initial ? [initial.program.id] : [])}
          allowDeselect={false}
          withAsterisk
          {...form.getInputProps("programId")}
        />
        <Select
          label="Status"
          description="Paket nonaktif tidak dapat dipilih di formulir pendaftaran."
          data={[...MASTER_STATUSES]}
          allowDeselect={false}
          {...form.getInputProps("status")}
        />
      </div>

      <div className="grid-2">
        <NumberInput
          label="Harga Layanan (Rp)"
          description="Satu harga utuh, sudah mencakup akademik dan administrasi penempatan."
          placeholder="45.000.000"
          min={0}
          allowDecimal={false}
          withAsterisk
          {...RUPIAH}
          {...form.getInputProps("priceIdr")}
        />
        <NumberInput
          label="Harga Layanan (Euro)"
          description="Kosongkan bila paket tanpa penempatan kerja."
          placeholder="800"
          prefix="€ "
          min={0}
          decimalScale={2}
          hideControls
          {...form.getInputProps("serviceFeeEur")}
        />
      </div>

      <div className="grid-2">
        <Checkbox
          label="Dana Talang ID"
          description="Paket memakai dana talang Indonesia."
          {...form.getInputProps("bridgingFundIdr", { type: "checkbox" })}
        />
        <Checkbox
          label="Dana Talang DE"
          description="Paket memakai dana talang Jerman."
          {...form.getInputProps("bridgingFundEur", { type: "checkbox" })}
        />
      </div>

      <div className="grid-2">
        <NumberInput
          label="Durasi (bulan)"
          description="Lama program sekaligus jumlah angsuran sesudah DP. Kosongkan bila paket dibayar tanpa cicilan."
          placeholder="12"
          min={1}
          max={120}
          allowDecimal={false}
          hideControls
          {...form.getInputProps("durationMonths")}
        />
        <NumberInput
          label="Nominal Bulanan"
          description="Terisi otomatis dari harga layanan dikurangi Minimal DP, dibagi durasi. Boleh diubah bila ingin dibulatkan."
          placeholder="3.333.000"
          min={0}
          allowDecimal={false}
          {...RUPIAH}
          {...form.getInputProps("monthlyIdr")}
        />
      </div>

      <div className="grid-2">
        <NumberInput
          label="Tanggal Tagih"
          description="Tanggal 1 sampai 31, berlaku untuk seluruh siswa paket ini. Tanggal 29 sampai 31 jatuh di hari terakhir bulan yang lebih pendek."
          placeholder="20"
          min={1}
          max={31}
          allowDecimal={false}
          hideControls
          {...form.getInputProps("billingDay")}
        />
      </div>

      <MultiSelect
        label="Cakupan Level"
        description="Level kursus yang termasuk paket ini, misalnya A1 sampai B2 atau hanya B1 dan B2."
        placeholder="Pilih level"
        data={optionsOf(levels, form.values.levelIds)}
        clearable
        {...form.getInputProps("levelIds")}
      />

      <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0, gap: 12 }}>
        <div className="stack" style={{ gap: 2 }}>
          <span className="field-label">9 Gerbang Pembayaran (Rp)</span>
          <span className="caption text-muted">
            Titik cicilan terhadap harga utuh, bukan harga layanan. 0 = langsung terbuka. Kosongkan
            bila layanan tidak termasuk paket. Minimal DP sekaligus menjadi DP paket.
          </span>
        </div>
        <div className="grid-3">
          {gates.map((gate) => (
            <NumberInput
              key={gate.id}
              label={gate.name}
              placeholder="—"
              min={0}
              allowDecimal={false}
              withAsterisk={gate.id === dpGate?.id}
              {...RUPIAH}
              {...form.getInputProps(`gates.${gate.id}`)}
            />
          ))}
        </div>
      </fieldset>

      {impact && (
        <Notice tone="warning" title="Perubahan gerbang berlaku untuk kontrak yang berjalan">
          {impact.changes.map((change) => change.name).join(", ")} berubah untuk{" "}
          {impact.affectedContracts} kontrak aktif paket ini. Layanan dapat terbuka atau tertutup
          bagi siswa itu begitu disimpan. Tekan simpan sekali lagi untuk menerapkannya.
        </Notice>
      )}
    </FormModal>
  )
}
