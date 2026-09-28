import { PageHeader } from "@/src/components/layout/PageHeader"
import { documentsQuery } from "@/src/entities/document/queries"
import { DOCUMENT_FILTERS } from "@/src/entities/document/schema"
import { masterItemsQuery } from "@/src/entities/master-data/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requirePermission } from "@/src/lib/auth/session"
import { listParamsOf, searchParamsSource } from "@/src/lib/list-query"

import { DocumentsWorkspace } from "./DocumentsWorkspace"

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requirePermission("documents")
  const params = listParamsOf(searchParamsSource(await searchParams), DOCUMENT_FILTERS)

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Dokumen"
        subtitle="Verifikasi berkas siswa untuk proses pemberkasan ke Jerman."
      />

      <Prefetched reads={[documentsQuery(params), masterItemsQuery()]}>
        <DocumentsWorkspace />
      </Prefetched>
    </div>
  )
}
