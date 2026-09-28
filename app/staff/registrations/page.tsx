import { PageHeader } from "@/src/components/layout/PageHeader"
import {
  draftRegistrationsQuery,
  registrationOptionsQuery,
  registrationQuery,
} from "@/src/entities/registration/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requirePermission } from "@/src/lib/auth/session"

import { DraftList } from "./DraftList"
import { NewContractButton } from "./NewContractButton"
import { RegistrationForm } from "./RegistrationForm"

const UUID = /^[0-9a-f-]{36}$/i
const STEP_COUNT = 7

export default async function RegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; step?: string }>
}) {
  await requirePermission("registrations", "edit")
  const { id, step } = await searchParams
  const studentId = id && UUID.test(id) ? id : null
  const initialStep = Math.min(STEP_COUNT - 1, Math.max(0, Number(step ?? 1) - 1 || 0))

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Pendaftaran Siswa Baru"
        subtitle="Tujuh langkah yang sama persis dengan form pendaftaran publik, hanya yang mengetik staf."
        actions={<NewContractButton />}
      />

      <Prefetched
        reads={[
          registrationOptionsQuery(),
          draftRegistrationsQuery(),
          ...(studentId ? [registrationQuery(studentId)] : []),
        ]}
      >
        <RegistrationForm
          key={studentId ?? "new"}
          studentId={studentId}
          initialStep={initialStep}
        />
        <DraftList activeId={studentId} />
      </Prefetched>
    </div>
  )
}
