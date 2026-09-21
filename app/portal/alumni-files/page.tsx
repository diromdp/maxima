import { PageHeader } from "@/src/components/layout/PageHeader"
import { requireSession } from "@/src/lib/auth/session"

import { AlumniFilesForm } from "./AlumniFilesForm"

/**
 * Layar 7 — Pemberkasan Alumni. Muncul di menu setelah siswa Dapat Vertrag;
 * gerbangnya milik data siswa dan belum ada backend, jadi halaman ini
 * sementara terbuka untuk siswa contoh.
 */
export default async function AlumniFilesPage() {
  await requireSession("student")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Pemberkasan Alumni"
        subtitle="Lengkapi data dan unggah dokumen untuk proses keberangkatan Anda ke Jerman."
      />

      <AlumniFilesForm />
    </div>
  )
}
