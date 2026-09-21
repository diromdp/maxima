import { PageHeader } from "@/src/components/layout/PageHeader"
import { requirePermission } from "@/src/lib/auth/session"

import { RegistrationForm } from "./RegistrationForm"

export default async function RegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>
}) {
  await requirePermission("registrations", "edit")
  const { step } = await searchParams
  const initialStep = Math.min(4, Math.max(0, Number(step ?? 1) - 1))

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Pendaftaran Siswa Baru"
        subtitle="Lima langkah. Datanya sama dengan form pendaftaran publik, hanya yang mengetik staf."
      />

      <RegistrationForm initialStep={initialStep} />
    </div>
  )
}
