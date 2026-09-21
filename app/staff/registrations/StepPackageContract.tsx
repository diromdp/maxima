import { Checkbox, NumberInput, ScrollArea, Select, TextInput } from "@mantine/core"
import type { UseFormReturnType } from "@mantine/form"

import { Notice } from "@/src/components/ui/Notice"
import { formatMoney } from "@/src/lib/money"

import { PACKAGES, resolvePromo, TERMS_TEXT } from "../../(public)/register/data"
import {
  PAYMENT_METHODS,
  priceBreakdown,
  type RegistrationValues,
  selectedPackage,
} from "./registration"

export function StepPackageContract({ form }: { form: UseFormReturnType<RegistrationValues> }) {
  const pkg = selectedPackage(form.values.packageId)
  const promo = resolvePromo(form.values.promoCode)
  const breakdown = priceBreakdown(form.values.packageId, form.values.promoCode)

  return (
    <div className="stack stack-lg">
      <div className="grid-4">
        <Select
          label="Paket Program"
          withAsterisk
          data={PACKAGES.map((p) => ({ value: p.id, label: p.name }))}
          allowDeselect={false}
          {...form.getInputProps("packageId")}
        />
        <TextInput
          label="Kode Promo / Potongan"
          description="Opsional."
          placeholder="Masukkan kode promo"
          {...form.getInputProps("promoCode")}
        />
        <Select
          label="Metode Pembayaran Awal"
          withAsterisk
          placeholder="Pilih metode"
          data={[...PAYMENT_METHODS]}
          {...form.getInputProps("paymentMethod")}
        />
        <NumberInput
          label="DP / Pembayaran Awal"
          withAsterisk
          description={`Minimum ${formatMoney(pkg.dp)} untuk paket ini.`}
          placeholder={formatMoney(pkg.dp)}
          prefix="Rp "
          thousandSeparator="."
          decimalSeparator=","
          hideControls
          min={0}
          {...form.getInputProps("downPayment")}
        />
      </div>

      {form.values.promoCode.trim() !== "" && (
        <Notice tone={promo.valid ? "success" : "danger"}>{promo.message}</Notice>
      )}

      <div className="grid-2">
        <section className="card stack">
          <h3 className="h6">Rincian Biaya & Layanan</h3>
          <dl className="stack stack-sm" style={{ margin: 0 }}>
            <div className="row row-between">
              <dt className="body-sm text-muted">Harga Paket (Nett)</dt>
              <dd className="body-sm tabular" style={{ margin: 0 }}>
                {formatMoney(breakdown.price)}
              </dd>
            </div>
            <div className="row row-between">
              <dt className="body-sm text-muted">Diskon Promo</dt>
              <dd
                className={`body-sm tabular${breakdown.promoValid ? " text-success" : ""}`}
                style={{ margin: 0 }}
              >
                {breakdown.promoValid
                  ? `- ${formatMoney(breakdown.discount)}`
                  : formatMoney(breakdown.discount)}
              </dd>
            </div>
            <div className="row row-between card-soft" style={{ padding: 12 }}>
              <dt className="body-sm" style={{ fontWeight: 600 }}>
                Harga Akhir Pembayaran
              </dt>
              <dd className="title tabular" style={{ margin: 0 }}>
                {formatMoney(breakdown.final)}
              </dd>
            </div>
          </dl>
          <span className="caption text-muted">
            {pkg.installments} angsuran, {pkg.durationLabel}. Tagihan bulanan dan tanggal tagih
            ditarik otomatis dari paket.
          </span>
        </section>

        <section className="card stack">
          <h3 className="h6">Pratinjau Kontrak Pendaftaran</h3>
          <ScrollArea h={180} className="card-soft" style={{ padding: 12 }}>
            <div className="stack stack-sm">
              <p className="body-sm">
                Kontrak belajar antara Maxima Stiftung dan{" "}
                <strong>{form.values.fullName || "calon siswa"}</strong> untuk program{" "}
                <strong>{form.values.program || "Ausbildung"}</strong>, paket{" "}
                <strong>{pkg.name}</strong>, cabang <strong>{form.values.branch || "-"}</strong>.
              </p>
              {TERMS_TEXT.map((term, index) => (
                <p key={term} className="body-sm text-muted">
                  {index + 1}. {term}
                </p>
              ))}
            </div>
          </ScrollArea>
          <Checkbox
            label="Siswa telah membaca dan menyetujui seluruh syarat dan ketentuan kontrak belajar."
            {...form.getInputProps("agreeContract", { type: "checkbox" })}
          />
        </section>
      </div>
    </div>
  )
}
