import { PageHeader } from "@/src/components/layout/PageHeader"
import { Notice } from "@/src/components/ui/Notice"
import { printTemplatesQuery } from "@/src/entities/print-template/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requirePermission } from "@/src/lib/auth/session"

import { TemplateGrid } from "./TemplateGrid"

export default async function PrintTemplatesPage() {
  await requirePermission("settings-print-templates")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Template Cetak"
        subtitle="Template surat, kwitansi, dan raport yang dicetak sistem. Isinya diambil dari database lewat placeholder."
      />

      <Notice tone="warning" title="Catatan">
        Semua template wajib menggunakan placeholder variabel otomatis yang mengambil data dinamis
        dari database. Nilai yang diketik langsung di template tidak akan ikut berubah saat data
        siswa berubah.
      </Notice>

      <Prefetched reads={[printTemplatesQuery()]}>
        <TemplateGrid />
      </Prefetched>
    </div>
  )
}
