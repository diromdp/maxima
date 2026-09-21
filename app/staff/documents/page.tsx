import { PageHeader } from "@/src/components/layout/PageHeader"
import { requirePermission } from "@/src/lib/auth/session"

import { DocumentsWorkspace } from "./DocumentsWorkspace"

export default async function DocumentsPage() {
  await requirePermission("documents")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Dokumen"
        subtitle="Verifikasi berkas siswa untuk proses pemberkasan ke Jerman."
      />

      <DocumentsWorkspace />
    </div>
  )
}
