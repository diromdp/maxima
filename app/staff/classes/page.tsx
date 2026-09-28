import { PageHeader } from "@/src/components/layout/PageHeader"
import { classesQuery } from "@/src/entities/class/queries"
import { CLASS_FILTERS, classFiltersOf } from "@/src/entities/class/schema"
import { masterItemsQuery } from "@/src/entities/master-data/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"
import { listParamsOf, searchParamsSource } from "@/src/lib/list-query"

import { AddClassButton } from "./AddClassButton"
import { ClassTabs } from "./ClassTabs"
import { ImportClassesButton } from "./ImportClassesButton"

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await requirePermission("classes")
  const record = await searchParams
  const filters = classFiltersOf(listParamsOf(searchParamsSource(record), CLASS_FILTERS))
  const isEditor = canEdit(session.permissions, "classes")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Kelas & Jadwal"
        subtitle="Manajemen daftar kelas, level bahasa, pengajar, dan alokasi kapasitas siswa."
        actions={
          isEditor ? (
            <div className="row row-wrap" style={{ gap: 8 }}>
              <ImportClassesButton />
              <AddClassButton />
            </div>
          ) : undefined
        }
      />

      <Prefetched reads={[classesQuery(filters), masterItemsQuery()]}>
        <ClassTabs canEdit={isEditor} />
      </Prefetched>
    </div>
  )
}
