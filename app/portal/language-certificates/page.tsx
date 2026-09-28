import { PageHeader } from "@/src/components/layout/PageHeader"
import {
  ownCertificateOptionsQuery,
  ownCertificatesQuery,
} from "@/src/entities/certificate/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requireSession } from "@/src/lib/auth/session"

import { CertificateTable } from "./CertificateTable"

export default async function LanguageCertificatesPage() {
  const session = await requireSession("student")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Sertifikat Bahasa"
        subtitle="Kelola data sertifikat bahasa Jerman Anda. Data akan dikirim ke admin untuk diverifikasi."
      />

      <Prefetched reads={[ownCertificatesQuery(), ownCertificateOptionsQuery()]}>
        <CertificateTable isOnLeave={session.status === "Cuti"} />
      </Prefetched>
    </div>
  )
}
