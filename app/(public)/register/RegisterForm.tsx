"use client"

import { Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Box, Button, Group, Stack, Text } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useEffect, useRef, useState } from "react"

import {
  DRAFT_STORAGE_KEY,
  INITIAL_VALUES,
  REQUIRED_DOCUMENT_COUNT,
  STEP_FIELDS,
  STEP_LABELS_SHORT,
  STEP_TITLES,
  DOCUMENTS,
  registrationSchema,
  zodFormResolver,
  type DocumentKey,
  type RegistrationValues,
} from "./data"
import { Step1PersonalData } from "./steps/Step1PersonalData"
import { Step2ProgramPackage } from "./steps/Step2ProgramPackage"
import { Step3ContactAddress } from "./steps/Step3ContactAddress"
import { Step4Education } from "./steps/Step4Education"
import { Step5Documents } from "./steps/Step5Documents"
import { Step6Review } from "./steps/Step6Review"
import { Step7AdminAccount } from "./steps/Step7AdminAccount"
import { Notice } from "@/src/components/ui/Notice"

const NEXT_LABELS = [
  "Lanjut ke Program & Paket",
  "Lanjut ke Kontak dan Alamat",
  "Lanjut ke Pendidikan",
  "Lanjut ke Unggah Dokumen",
  "Lanjut ke Persetujuan",
  "Lanjut Akun Admission",
]

const EMPTY_DOCUMENTS: Record<DocumentKey, File | null> = {
  pasFoto: null,
  aktaKelahiran: null,
  kartuKeluarga: null,
  ktp: null,
  ijazah: null,
  transkrip: null,
  paspor: null,
  suratKontrak: null,
}

type Draft = { values: RegistrationValues; step: number }

const SKIP_VALIDATION = true

export function RegisterForm() {
  const [step, setStep] = useState(0)
  const [documents, setDocuments] = useState(EMPTY_DOCUMENTS)
  const [hasSignature, setHasSignature] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const hydrated = useRef(false)

  const form = useForm<RegistrationValues>({
    initialValues: INITIAL_VALUES,
    validate: zodFormResolver(registrationSchema),
  })

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY)
      if (raw) {
        const draft = JSON.parse(raw) as Draft
        form.setValues(draft.values)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStep(draft.step)
      }
    } catch {}
    hydrated.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hydrated.current) return
    const id = window.setTimeout(() => {
      try {
        const draft: Draft = { values: form.values, step }
        window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
      } catch {}
    }, 400)
    return () => window.clearTimeout(id)
  }, [form.values, step])

  const uploadedRequired = DOCUMENTS.filter((d) => d.required && documents[d.key]).length

  function setDocument(key: DocumentKey, file: File | null) {
    setDocuments((prev) => ({ ...prev, [key]: file }))
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1))
  }

  function handleNext() {
    if (SKIP_VALIDATION) {
      if (step === STEP_TITLES.length - 1) {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY)
        setSubmitted(true)
        return
      }
      setStep((s) => s + 1)
      return
    }

    form.validate()
    const stepValid = STEP_FIELDS[step].every((field) => !form.errors[field])
    const documentsValid = step !== 4 || uploadedRequired === REQUIRED_DOCUMENT_COUNT
    const signatureValid = step !== 5 || hasSignature

    if (!stepValid || !documentsValid || !signatureValid) return

    if (step === STEP_TITLES.length - 1) {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY)
      setSubmitted(true)
      return
    }
    setStep((s) => s + 1)
  }

  if (submitted) {
    return (
      <Box className="card" p="xl">
        <Stack gap="xs" align="center" ta="center">
          <Text ff="heading" fw={650} size="24px">
            Pendaftaran terkirim.
          </Text>
          <Text c="dimmed">
            Tagihan DP dikirim lewat email ke {form.values.email || "email yang kamu daftarkan"}.
            NIS terbit setelah DP diterima dan disahkan Finance.
          </Text>

          <Button component="a" href="/" mt="md">
            Kembali ke halaman masuk
          </Button>
        </Stack>
      </Box>
    )
  }

  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Text ff="heading" fw={650} size="28px">
          Formulir Pendaftaran
        </Text>
        <Text c="dimmed" size="sm">
          Langkah {step + 1} dari 7
        </Text>
      </Stack>

      <StepBar step={step} />

      <Box className="card" p="lg">
        <h2 className="h5" style={{ marginBottom: 16 }}>
          {STEP_TITLES[step]}
        </h2>

        {step === 0 && <Step1PersonalData form={form} />}
        {step === 1 && <Step2ProgramPackage form={form} />}
        {step === 2 && <Step3ContactAddress form={form} />}
        {step === 3 && <Step4Education form={form} />}
        {step === 4 && <Step5Documents documents={documents} onChange={setDocument} />}
        {step === 5 && (
          <Step6Review
            form={form}
            documents={documents}
            hasSignature={hasSignature}
            onSignatureChange={setHasSignature}
          />
        )}
        {step === 6 && <Step7AdminAccount form={form} />}

        {step === 0 && (
          <Notice tone="warning" className="mt-6">
            Pendaftaran hanya bisa dikirim jika seluruh field wajib dan {REQUIRED_DOCUMENT_COUNT}{" "}
            dokumen wajib sudah terisi sesuai format. Sistem menolak kiriman yang belum lengkap.
          </Notice>
        )}
      </Box>

      <Group justify="space-between" wrap="nowrap">
        <Button variant="default" onClick={handleBack} disabled={step === 0}>
          Kembali
        </Button>
        <Button onClick={handleNext}>
          {step === STEP_TITLES.length - 1 ? "Kirim Pendaftaran" : NEXT_LABELS[step]}
        </Button>
      </Group>
    </Stack>
  )
}

/** Tujuh langkah sebagai tangga: centang untuk yang lewat, nomor untuk sisanya. Pola `.journey` yang sama dengan Progres Administrasi. */
function StepBar({ step }: { step: number }) {
  return (
    <ol className="journey" aria-label="Langkah pendaftaran">
      {STEP_LABELS_SHORT.map((label, i) => {
        const state = i < step ? "selesai" : i === step ? "dikerjakan" : "menunggu"
        return (
          <li
            key={label}
            className="journey-node"
            data-state={state}
            aria-current={i === step ? "step" : undefined}
          >
            <span className="journey-dot" aria-hidden>
              {i < step ? <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2} /> : i + 1}
            </span>
            <span className="caption" style={{ fontWeight: i === step ? 600 : 400 }}>
              {/* Nomornya sudah di lingkaran. */}
              {label.replace(/^\d+\s/, "")}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
