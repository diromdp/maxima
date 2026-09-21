import { Checkbox } from "@mantine/core"
import type { UseFormReturnType } from "@mantine/form"

import { Step7AdminAccount } from "../../(public)/register/steps/Step7AdminAccount"
import type { RegistrationValues } from "./registration"
import { SignaturePad } from "./SignaturePad"

const AGREEMENTS = [
  {
    key: "agreeAccurate",
    label: "Data dan dokumen yang diisi benar dan dapat dipertanggungjawabkan.",
  },
  {
    key: "agreeAdmission",
    label: "Siswa menyetujui syarat dan ketentuan paket pembayaran yang dipilih.",
  },
  {
    key: "agreeDataUse",
    label: "Siswa memberikan izin penggunaan data untuk aplikasi program ke Jerman.",
  },
  {
    key: "agreeSignature",
    label: "Tanda tangan yang diunggah berlaku sebagai pengganti tanda tangan basah.",
  },
] as const

export function StepAdminAccount({
  form,
  signature,
  onSignatureChange,
}: {
  form: UseFormReturnType<RegistrationValues>
  signature: File | null
  onSignatureChange: (file: File | null) => void
}) {
  return (
    <div className="grid-2" style={{ alignItems: "start" }}>
      <section className="card stack">
        <h3 className="h6">Akun Admission</h3>
        <Step7AdminAccount form={form} />
      </section>

      <section className="card stack">
        <h3 className="h6">Persetujuan & Tanda Tangan</h3>
        <div className="stack stack-sm">
          {AGREEMENTS.map((item) => (
            <Checkbox
              key={item.key}
              label={item.label}
              {...form.getInputProps(item.key, { type: "checkbox" })}
            />
          ))}
        </div>
        <SignaturePad signature={signature} onChange={onSignatureChange} />
      </section>
    </div>
  )
}
