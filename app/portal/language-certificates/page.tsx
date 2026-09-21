import { PageHeader } from "@/src/components/layout/PageHeader"
import { requireSession } from "@/src/lib/auth/session"

import { AddCertificateModal } from "./AddCertificateModal"
import { CertificateTable } from "./CertificateTable"

export default async function LanguageCertificatesPage() {
  await requireSession("student")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Sertifikat Bahasa"
        subtitle="Kelola data sertifikat bahasa Jerman Anda. Data akan dikirim ke admin untuk diverifikasi."
      />

      <section className="card stack">
        <div className="row row-between">
          <h2 className="h5">Sertifikat Saya</h2>
          <AddCertificateModal />
        </div>
        <CertificateTable />
      </section>
    </div>
  )
}
