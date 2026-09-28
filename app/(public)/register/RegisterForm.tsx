"use client"

import { useState } from "react"

import { QueryError } from "@/src/components/data/QueryError"
import {
  confirmMyDocument,
  presignMyDocument,
  saveMySection,
  startPublicRegistration,
  submitMyRegistration,
} from "@/src/entities/registration/actions"
import {
  myRegistrationOptionsQuery,
  myRegistrationQuery,
} from "@/src/entities/registration/queries"
import type { RegistrationView } from "@/src/entities/registration/schema"
import { useRead } from "@/src/lib/api/use-read"
import { homePath } from "@/src/lib/auth/paths"
import { formatMoney, idr } from "@/src/lib/money"

import { RegistrationWizard, WizardSkeleton, type RegistrationAdapter } from "./RegistrationWizard"

const INTRO =
  "Setiap langkah tersimpan saat tombol Lanjut ditekan. Untuk melanjutkan nanti, buka halaman ini lagi lalu isi email dan password yang sama di langkah 1. Pendaftaran hanya dapat dikirim bila seluruh isian wajib, dokumen wajib, dan tanda tangan sudah lengkap."

const CANDIDATE_ADAPTER: RegistrationAdapter = {
  optionsQuery: myRegistrationOptionsQuery(),
  draftQuery: myRegistrationQuery,
  start: (body) => startPublicRegistration(body),
  save: ({ section, body }) => saveMySection(section, body),
  presign: ({ studentId, code, mimeType, sizeBytes }) =>
    presignMyDocument(studentId, code, mimeType, sizeBytes),
  confirm: ({ code, fileName }) => confirmMyDocument(code, fileName),
  submit: () => submitMyRegistration(),
}

function Submitted({ draft }: { draft: RegistrationView }) {
  return (
    <section className="card stack items-center py-10 text-center">
      <span className="title">Pendaftaran terkirim.</span>
      <span className="body-sm text-muted" style={{ maxWidth: 520 }}>
        Tagihan DP {draft.contract ? formatMoney(idr(draft.contract.downPaymentIdr)) : ""} dikirim
        lewat email ke {draft.email ?? "email yang kamu daftarkan"}. NIS terbit setelah DP diterima
        dan disahkan Finance.
      </span>
      <a className="btn btn-primary" href={homePath("student")}>
        Buka Portal Siswa
      </a>
    </section>
  )
}

function Wizard({ initialDraft }: { initialDraft: RegistrationView | null }) {
  return (
    <RegistrationWizard
      adapter={CANDIDATE_ADAPTER}
      initialDraft={initialDraft}
      initialStep={0}
      intro={INTRO}
      renderSubmitted={(draft) => <Submitted draft={draft} />}
    />
  )
}

function DraftLoader() {
  const draft = useRead(myRegistrationQuery())
  if (draft.isError) {
    return <QueryError message={draft.error.message} onRetry={() => void draft.refetch()} />
  }
  if (draft.isPending) return <WizardSkeleton />
  return <Wizard initialDraft={draft.data} />
}

export function RegisterForm({ isCandidate }: { isCandidate: boolean }) {
  const [hasDraftAtLoad] = useState(isCandidate)
  return (
    <div className="stack stack-lg">
      <div className="stack" style={{ gap: 4 }}>
        <h1 className="h3">Formulir Pendaftaran</h1>
        <span className="body-sm text-muted">Tujuh langkah. Isi sesuai dokumen resmi.</span>
      </div>
      {hasDraftAtLoad ? <DraftLoader /> : <Wizard initialDraft={null} />}
    </div>
  )
}
