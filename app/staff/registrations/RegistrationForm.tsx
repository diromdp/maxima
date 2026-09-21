"use client"

import { Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useForm } from "@mantine/form"
import { notify } from "@/src/lib/notify"
import Link from "next/link"
import { useState } from "react"

import { Notice } from "@/src/components/ui/Notice"
import { formatMoney } from "@/src/lib/money"

import { type DocumentKey, REQUIRED_DOCUMENT_COUNT } from "../../(public)/register/data"
import { Step4Education } from "../../(public)/register/steps/Step4Education"
import {
  INITIAL_VALUES,
  priceBreakdown,
  type RegistrationValues,
  selectedPackage,
  STEPS,
} from "./registration"
import { StepAdminAccount } from "./StepAdminAccount"
import {
  type Documents,
  EMPTY_DOCUMENTS,
  StepDocuments,
  uploadedRequiredCount,
} from "./StepDocuments"
import { StepPackageContract } from "./StepPackageContract"
import { StepPersonalData } from "./StepPersonalData"
import { StepProgram } from "./StepProgram"

function StepBar({ step }: { step: number }) {
  return (
    <ol className="journey" aria-label="Langkah pendaftaran">
      {STEPS.map((item, index) => {
        const state = index < step ? "selesai" : index === step ? "dikerjakan" : "menunggu"
        return (
          <li
            key={item.title}
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
            <span className="body-sm" style={{ fontWeight: index === step ? 600 : 400 }}>
              {item.short}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="label text-muted" style={{ letterSpacing: 0 }}>
      {children}
    </h3>
  )
}

export function RegistrationForm({ initialStep = 0 }: { initialStep?: number }) {
  const [step, setStep] = useState(initialStep)
  const [documents, setDocuments] = useState<Documents>(EMPTY_DOCUMENTS)
  const [signature, setSignature] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<RegistrationValues>({ initialValues: INITIAL_VALUES })

  const uploaded = uploadedRequiredCount(documents)
  const isLast = step === STEPS.length - 1

  const blockers = isLast
    ? [
        uploaded < REQUIRED_DOCUMENT_COUNT
          ? `lengkapi ${REQUIRED_DOCUMENT_COUNT - uploaded} dokumen wajib di langkah 4`
          : null,
        form.values.agreeContract ? null : "centang persetujuan kontrak di langkah 3",
        form.values.agreeAccurate &&
        form.values.agreeAdmission &&
        form.values.agreeDataUse &&
        form.values.agreeSignature
          ? null
          : "centang empat persetujuan",
        signature ? null : "unggah tanda tangan siswa",
      ].filter((item): item is string => item !== null)
    : []

  function setDocument(key: DocumentKey, file: File | null) {
    setDocuments((current) => ({ ...current, [key]: file }))
  }

  function next() {
    if (isLast) {
      setSubmitted(true)
      notify.success(
        `Pendaftaran ${form.values.fullName || "calon siswa"} tersimpan. Tagihan DP dikirim ke ${form.values.email || "email calon"}.`,
      )
      return
    }
    setStep((current) => current + 1)
  }

  if (submitted) {
    const pkg = selectedPackage(form.values.packageId)
    const breakdown = priceBreakdown(form.values.packageId, form.values.promoCode)
    return (
      <section className="card stack items-center py-10 text-center">
        <span className="title">Pendaftaran tersimpan</span>
        <span className="body-sm text-muted" style={{ maxWidth: 520 }}>
          {form.values.fullName || "Calon siswa"} terdaftar di paket {pkg.name}, cabang{" "}
          {form.values.branch || "-"}, PIC {form.values.consultant || "-"}. Tagihan DP{" "}
          {formatMoney(pkg.dp)} dari total {formatMoney(breakdown.final)} dikirim ke{" "}
          {form.values.email || "email calon"}. NIS terbit setelah Finance mengesahkan DP.
        </span>
        <div className="row" style={{ gap: 8 }}>
          <Link className="btn btn-secondary" href="/staff/students">
            Lihat Daftar Siswa
          </Link>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              form.reset()
              setDocuments(EMPTY_DOCUMENTS)
              setSignature(null)
              setStep(0)
              setSubmitted(false)
            }}
          >
            Daftarkan Siswa Lain
          </button>
        </div>
      </section>
    )
  }

  return (
    <div className="stack stack-lg">
      <section className="card">
        <StepBar step={step} />
      </section>

      <section className="card stack stack-lg">
        <div className="stack" style={{ gap: 2 }}>
          <h2 className="h5">
            Langkah {step + 1}: {STEPS[step]!.title}
          </h2>
          <span className="caption text-muted">
            {step === 0 && "Identitas, kontak, alamat, lalu pendidikan dan pengalaman."}
            {step === 1 && "Program, jalur masuk, cabang, sumber lead, dan PIC."}
            {step === 2 && "Paket, promo, pembayaran awal, dan kontrak yang akan ditandatangani."}
            {step === 3 && "Enam dokumen wajib, dua dokumen boleh menyusul."}
            {step === 4 && "Akun untuk pengajuan ke Jerman, persetujuan, dan tanda tangan."}
          </span>
        </div>

        {step === 0 && (
          <div className="stack stack-lg">
            <div className="stack">
              <SectionTitle>Formulir Data Diri Siswa</SectionTitle>
              <StepPersonalData form={form} />
            </div>
            <div className="stack">
              <SectionTitle>Pendidikan dan Pengalaman</SectionTitle>
              <Step4Education form={form} />
            </div>
          </div>
        )}
        {step === 1 && <StepProgram form={form} />}
        {step === 2 && <StepPackageContract form={form} />}
        {step === 3 && <StepDocuments documents={documents} onChange={setDocument} />}
        {step === 4 && (
          <StepAdminAccount form={form} signature={signature} onSignatureChange={setSignature} />
        )}

        {step === 0 && (
          <Notice tone="info">
            NIS terbit setelah Finance mengesahkan DP. Sebelum itu calon dipegang lewat email dan
            nama, belum muncul di halaman Siswa.
          </Notice>
        )}
      </section>

      <div className="row row-between row-wrap" style={{ gap: 12 }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          disabled={step === 0}
        >
          Kembali
        </button>
        <div className="stack" style={{ gap: 6, alignItems: "flex-end", flex: "1 1 auto" }}>
          {isLast && (
            <span className="caption text-muted" aria-live="polite" style={{ textAlign: "right" }}>
              {blockers.length > 0
                ? `Sebelum selesai: ${blockers.join(", ")}.`
                : "Semua lengkap. Tagihan DP terkirim begitu diselesaikan."}
            </span>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={next}
            disabled={isLast && blockers.length > 0}
          >
            {isLast ? "Selesaikan Pendaftaran" : "Selanjutnya"}
          </button>
        </div>
      </div>
    </div>
  )
}
