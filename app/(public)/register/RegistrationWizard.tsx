"use client"

import { Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Skeleton } from "@mantine/core"
import { schemaResolver, useForm, type UseFormReturnType } from "@mantine/form"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"

import { QueryError } from "@/src/components/data/QueryError"
import { Notice } from "@/src/components/ui/Notice"
import {
  SIGNATURE_DOCUMENT,
  type RegistrationOptions,
  type RegistrationSection,
  type RegistrationView,
} from "@/src/entities/registration/schema"
import { failureOf, type ActionResult } from "@/src/lib/api/errors"
import type { ReadQuery } from "@/src/lib/api/read"
import { useRead } from "@/src/lib/api/use-read"
import { formatFileSize } from "@/src/lib/format"
import { formatMoney, idr } from "@/src/lib/money"
import {
  isUploadable,
  putToStorage,
  UPLOAD_FAILED,
  UPLOAD_RULE,
  type UploadTarget,
} from "@/src/lib/upload"

import { registrationSchema, STEP_LABELS_SHORT, STEP_TITLES, type RegistrationValues } from "./data"
import {
  admissionBodyOf,
  consentBodyOf,
  contactBodyOf,
  educationBodyOf,
  fieldsToCheck,
  formErrorsOf,
  identityBodyOf,
  keepsAdmissionPassword,
  programBodyOf,
  valuesOf,
} from "./registration-fields"
import { Step1PersonalData } from "./steps/Step1PersonalData"
import { Step2ProgramPackage } from "./steps/Step2ProgramPackage"
import { Step3ContactAddress } from "./steps/Step3ContactAddress"
import { Step4Education } from "./steps/Step4Education"
import { Step5Documents, type DocumentSlot } from "./steps/Step5Documents"
import { Step6Review } from "./steps/Step6Review"
import { Step7AdminAccount } from "./steps/Step7AdminAccount"

type Saved = Promise<ActionResult<RegistrationView>>

export type RegistrationAdapter = {
  optionsQuery: ReadQuery<RegistrationOptions>
  draftQuery: (studentId: string) => ReadQuery<RegistrationView>
  start: (body: { email: string; password: string } & Record<string, unknown>) => Saved
  save: (input: {
    studentId: string
    section: RegistrationSection
    body: Record<string, unknown>
  }) => Saved
  presign: (input: {
    studentId: string
    code: string
    mimeType: string
    sizeBytes: number
  }) => Promise<ActionResult<UploadTarget>>
  confirm: (input: { studentId: string; code: string; fileName: string }) => Saved
  submit: (input: { studentId: string }) => Saved
}

const LAST_STEP = STEP_TITLES.length - 1
const DOCUMENTS_STEP = 4
const CONSENT_STEP = 5
const DASH = "-"
const SIGNATURE_REQUIRED = "Tanda tangan wajib digambar sebelum melanjutkan."
const SIGNATURE_SAVED = "Tanda tangan sudah tersimpan. Gambar ulang untuk menggantinya."
const REJECTED = "Ditolak saat verifikasi. Unggah ulang berkasnya."

const isStored = (status: string | null) => status !== null && status !== "Ditolak"

const canvasBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))

export function WizardSkeleton() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <Skeleton height={88} radius="md" aria-hidden />
      <Skeleton height={420} radius="md" aria-hidden />
    </div>
  )
}

function StepBar({ step }: { step: number }) {
  return (
    <ol className="journey" aria-label="Langkah pendaftaran">
      {STEP_LABELS_SHORT.map((label, index) => {
        const state = index < step ? "selesai" : index === step ? "dikerjakan" : "menunggu"
        return (
          <li
            key={label}
            className="journey-node"
            data-state={state}
            aria-current={index === step ? "step" : undefined}
          >
            <span className="journey-dot" aria-hidden>
              {index < step ? (
                <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2} />
              ) : (
                index + 1
              )}
            </span>
            <span className="caption" style={{ fontWeight: index === step ? 600 : 400 }}>
              {STEP_TITLES[index]}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function ProgramStep({
  form,
  optionsQuery,
  draft,
}: {
  form: UseFormReturnType<RegistrationValues>
  optionsQuery: ReadQuery<RegistrationOptions>
  draft: RegistrationView | null
}) {
  const options = useRead(optionsQuery)
  const packageId = form.values.packageId
  const programOfPackage = options.data?.packages.find((pkg) => pkg.id === packageId)?.programId

  useEffect(() => {
    if (programOfPackage && !form.values.program) form.setFieldValue("program", programOfPackage)
  }, [programOfPackage, form])

  if (options.isError) {
    return <QueryError message={options.error.message} onRetry={() => void options.refetch()} />
  }
  if (options.isPending) return <Skeleton height={420} radius="md" />
  return <Step2ProgramPackage form={form} options={options.data} contract={draft?.contract} />
}

export function RegistrationWizard({
  adapter,
  initialDraft,
  initialStep,
  intro,
  onStepSaved,
  renderSubmitted,
}: {
  adapter: RegistrationAdapter
  initialDraft: RegistrationView | null
  initialStep: number
  intro: string
  onStepSaved?: (draft: RegistrationView, nextStep: number) => void
  renderSubmitted: (draft: RegistrationView) => React.ReactNode
}) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState(initialDraft)
  const [step, setStep] = useState(initialDraft ? initialStep : 0)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [busyCode, setBusyCode] = useState<string | null>(null)
  const [documentErrors, setDocumentErrors] = useState<Record<string, string>>({})
  const [fileNames, setFileNames] = useState<Record<string, string>>({})
  const [hasDrawn, setHasDrawn] = useState(false)
  const signatureRef = useRef<HTMLCanvasElement>(null)

  const optionsOf = () =>
    queryClient.getQueryData<RegistrationOptions>(adapter.optionsQuery.queryKey)
  const programOf = (packageId: string) =>
    optionsOf()?.packages.find((pkg) => pkg.id === packageId)?.programId ?? ""
  const form = useForm<RegistrationValues>({
    initialValues: valuesOf(initialDraft, programOf),
    validate: schemaResolver(registrationSchema, { sync: true }),
    validateInputOnBlur: true,
  })

  const signature = draft?.documents.find((doc) => doc.code === SIGNATURE_DOCUMENT)
  const isSignatureSaved = isStored(signature?.status ?? null)
  const documentRows = draft?.documents.filter((doc) => doc.code !== SIGNATURE_DOCUMENT) ?? []
  const requiredRows = documentRows.filter((doc) => doc.required)
  const uploadedRequired = requiredRows.filter((doc) => isStored(doc.status)).length

  const slots: DocumentSlot[] = documentRows.map((doc) => ({
    code: doc.code,
    name: doc.name,
    required: doc.required,
    fileName:
      fileNames[doc.code] ??
      (doc.status && doc.sizeBytes ? `Tersimpan · ${formatFileSize(doc.sizeBytes)}` : null),
    isUploaded: isStored(doc.status),
    error: documentErrors[doc.code] ?? (doc.status === "Ditolak" ? REJECTED : null),
  }))

  const contract = draft?.contract ?? null
  const programName = contract
    ? optionsOf()?.programs.find((program) => program.id === programOf(contract.package.id))?.name
    : undefined
  const summary = [
    ["Nama lengkap", form.values.fullName || DASH],
    [
      "Program dan paket",
      contract ? [programName, contract.package.name].filter(Boolean).join(" - ") : DASH,
    ],
    ["Cabang", draft?.program.branch?.name ?? DASH],
    ["Harga setelah promo", contract ? formatMoney(idr(contract.finalPriceIdr)) : DASH],
    ["Minimum DP", contract ? formatMoney(idr(contract.downPaymentIdr)) : DASH],
    ["Dokumen wajib", `${uploadedRequired} dari ${requiredRows.length} lengkap`],
  ] as const

  async function uploadDocument(studentId: string, code: string, file: Blob, fileName: string) {
    if (!isUploadable(file)) return failureOf<RegistrationView>(UPLOAD_RULE)
    const target = await adapter.presign({
      studentId,
      code,
      mimeType: file.type,
      sizeBytes: file.size,
    })
    if (!target.ok) return target
    if (!(await putToStorage(target.data, file))) return failureOf<RegistrationView>(UPLOAD_FAILED)
    return adapter.confirm({ studentId, code, fileName })
  }

  function keep(result: ActionResult<RegistrationView>): boolean {
    if (result.ok) {
      if (!draft) form.setValues(valuesOf(result.data, programOf))
      setDraft(result.data)
      queryClient.setQueryData(adapter.draftQuery(result.data.studentId).queryKey, result.data)
      return true
    }
    if (Object.keys(result.fieldErrors).length > 0) form.setErrors(formErrorsOf(result.fieldErrors))
    setFormError(result.message)
    return false
  }

  async function selectDocument(code: string, file: File | null) {
    if (!file || !draft) return
    setBusyCode(code)
    const result = await uploadDocument(draft.studentId, code, file, file.name)
    setBusyCode(null)
    if (!result.ok) {
      setDocumentErrors((current) => ({ ...current, [code]: result.message }))
      return
    }
    setDraft(result.data)
    setFileNames((current) => ({
      ...current,
      [code]: `${file.name} · ${formatFileSize(file.size)}`,
    }))
    setDocumentErrors((current) =>
      Object.fromEntries(Object.entries(current).filter(([key]) => key !== code)),
    )
  }

  async function saveStep(values: RegistrationValues): Saved {
    if (!draft) {
      return adapter.start({
        email: values.email.trim(),
        password: values.password,
        ...identityBodyOf(values),
      })
    }
    const studentId = draft.studentId
    const save = (section: RegistrationSection, body: Record<string, unknown>) =>
      adapter.save({ studentId, section, body })
    if (step === 0) return save("identity", identityBodyOf(values))
    if (step === 1) return save("program", programBodyOf(values))
    if (step === 2) return save("contact", contactBodyOf(values))
    if (step === 3) return save("education", educationBodyOf(values))
    if (step === DOCUMENTS_STEP) return { ok: true, data: draft }
    if (step === CONSENT_STEP) {
      const saved = await save("consent", consentBodyOf(values))
      const canvas = signatureRef.current
      if (!saved.ok || !hasDrawn || !canvas) return saved
      const blob = await canvasBlob(canvas)
      if (!blob) return failureOf(UPLOAD_FAILED)
      const uploaded = await uploadDocument(studentId, SIGNATURE_DOCUMENT, blob, "tanda-tangan.png")
      if (uploaded.ok) setHasDrawn(false)
      return uploaded
    }
    if (!keepsAdmissionPassword(draft, values)) {
      const saved = await save("admission-account", admissionBodyOf(values))
      if (!saved.ok) return saved
    }
    return adapter.submit({ studentId })
  }

  async function next() {
    setFormError(null)
    const fields = fieldsToCheck(step, draft, form.values)
    const hasErrors = fields.map((field) => form.validateField(field).hasError).some(Boolean)
    if (hasErrors) return
    if (step === CONSENT_STEP && !hasDrawn && !isSignatureSaved) {
      setFormError(SIGNATURE_REQUIRED)
      return
    }

    setIsSaving(true)
    const result = await saveStep(form.values)
    setIsSaving(false)
    if (!keep(result) || !result.ok) return
    onStepSaved?.(result.data, step + 1)
    if (step < LAST_STEP) setStep((current) => current + 1)
  }

  if (draft?.submittedAt) return renderSubmitted(draft)

  return (
    <div className="stack stack-lg">
      <section className="card">
        <StepBar step={step} />
      </section>

      <section className="card stack stack-lg">
        <h2 className="h5">
          Langkah {step + 1}: {STEP_TITLES[step]}
        </h2>

        {formError && <Notice tone="danger">{formError}</Notice>}

        {step === 0 && <Step1PersonalData form={form} isAccountLocked={draft !== null} />}
        {step === 1 && (
          <ProgramStep form={form} optionsQuery={adapter.optionsQuery} draft={draft} />
        )}
        {step === 2 && <Step3ContactAddress form={form} />}
        {step === 3 && <Step4Education form={form} />}
        {step === DOCUMENTS_STEP && (
          <Step5Documents
            slots={slots}
            busyCode={busyCode}
            onSelect={(code, file) => void selectDocument(code, file)}
          />
        )}
        {step === CONSENT_STEP && (
          <Step6Review
            form={form}
            summary={summary}
            canvasRef={signatureRef}
            hasSignature={hasDrawn || isSignatureSaved}
            signatureNote={isSignatureSaved && !hasDrawn ? SIGNATURE_SAVED : undefined}
            onSignatureChange={setHasDrawn}
          />
        )}
        {step === LAST_STEP && <Step7AdminAccount form={form} />}

        {step === 0 && <Notice tone="info">{intro}</Notice>}
      </section>

      <div className="row row-between row-wrap" style={{ gap: 12 }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setFormError(null)
            setStep((current) => Math.max(0, current - 1))
          }}
          disabled={step === 0 || isSaving}
        >
          Kembali
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => void next()}
          disabled={isSaving || busyCode !== null}
        >
          {isSaving
            ? "Menyimpan..."
            : step === LAST_STEP
              ? "Kirim Pendaftaran"
              : `Simpan dan Lanjut ke ${STEP_TITLES[step + 1]}`}
        </button>
      </div>
    </div>
  )
}
