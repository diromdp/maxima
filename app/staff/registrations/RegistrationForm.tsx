"use client"

import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"

import { QueryError } from "@/src/components/data/QueryError"
import {
  confirmRegistrationDocument,
  presignRegistrationDocument,
  saveRegistrationSection,
  startRegistration,
  submitRegistration,
} from "@/src/entities/registration/actions"
import { registrationOptionsQuery, registrationQuery } from "@/src/entities/registration/queries"
import type { RegistrationView } from "@/src/entities/registration/schema"
import { useRead } from "@/src/lib/api/use-read"
import { formatMoney, idr } from "@/src/lib/money"

import {
  RegistrationWizard,
  WizardSkeleton,
  type RegistrationAdapter,
} from "../../(public)/register/RegistrationWizard"

const INTRO =
  "Isiannya sama dengan form pendaftaran publik. Setiap langkah tersimpan saat Lanjut ditekan, jadi draf dapat dilanjutkan nanti. NIS terbit setelah Finance mengesahkan DP."

const STAFF_ADAPTER: RegistrationAdapter = {
  optionsQuery: registrationOptionsQuery(),
  draftQuery: registrationQuery,
  start: (body) => startRegistration(body),
  save: ({ studentId, section, body }) => saveRegistrationSection(studentId, section, body),
  presign: ({ studentId, code, mimeType, sizeBytes }) =>
    presignRegistrationDocument(studentId, code, mimeType, sizeBytes),
  confirm: ({ studentId, code, fileName }) =>
    confirmRegistrationDocument(studentId, code, fileName),
  submit: ({ studentId }) => submitRegistration(studentId),
}

function Submitted({ draft }: { draft: RegistrationView }) {
  return (
    <section className="card stack items-center py-10 text-center">
      <span className="title">Pendaftaran terkirim</span>
      <span className="body-sm text-muted" style={{ maxWidth: 520 }}>
        Tagihan DP {draft.contract ? formatMoney(idr(draft.contract.downPaymentIdr)) : ""} dikirim
        ke {draft.email ?? "email calon"}. NIS terbit setelah Finance mengesahkan DP.
      </span>
      <div className="row" style={{ gap: 8 }}>
        <Link className="btn btn-secondary" href="/staff/students">
          Lihat Daftar Siswa
        </Link>
        <a className="btn btn-primary" href="/staff/registrations">
          Daftarkan Siswa Lain
        </a>
      </div>
    </section>
  )
}

function StaffWizard({
  initialDraft,
  initialStep,
}: {
  initialDraft: RegistrationView | null
  initialStep: number
}) {
  const queryClient = useQueryClient()
  return (
    <RegistrationWizard
      adapter={STAFF_ADAPTER}
      initialDraft={initialDraft}
      initialStep={initialStep}
      intro={INTRO}
      onStepSaved={(draft, nextStep) => {
        window.history.replaceState(null, "", `?id=${draft.studentId}&step=${nextStep + 1}`)
        if (nextStep === 1 || draft.submittedAt) {
          void queryClient.invalidateQueries({ queryKey: ["registrations"] })
        }
      }}
      renderSubmitted={(draft) => <Submitted draft={draft} />}
    />
  )
}

function DraftLoader({ studentId, initialStep }: { studentId: string; initialStep: number }) {
  const draft = useRead(registrationQuery(studentId))
  if (draft.isError) {
    return <QueryError message={draft.error.message} onRetry={() => void draft.refetch()} />
  }
  if (draft.isPending) return <WizardSkeleton />
  return <StaffWizard initialDraft={draft.data} initialStep={initialStep} />
}

export function RegistrationForm({
  studentId,
  initialStep,
}: {
  studentId: string | null
  initialStep: number
}) {
  if (!studentId) return <StaffWizard initialDraft={null} initialStep={0} />
  return <DraftLoader studentId={studentId} initialStep={initialStep} />
}
