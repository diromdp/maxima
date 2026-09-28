"use client"

import { QueryError } from "@/src/components/data/QueryError"
import { TableSkeleton } from "@/src/components/data/TableSkeleton"
import { draftRegistrationsQuery } from "@/src/entities/registration/queries"
import { useRead } from "@/src/lib/api/use-read"
import { formatDate } from "@/src/lib/format"

const DASH = "-"
const COLUMNS = 6
const SKELETON_ROWS = 3

export function DraftList({ activeId }: { activeId: string | null }) {
  const drafts = useRead(draftRegistrationsQuery())

  return (
    <section className="card stack">
      <div className="row">
        <h2 className="h6">Pendaftaran belum dikirim</h2>
        {drafts.data && <span className="pill tabular">{drafts.data.meta.total} draf</span>}
      </div>
      <p className="body-sm text-muted">
        Draf dari halaman ini dan dari form publik. Calon muncul di halaman Siswa setelah DP
        disahkan.
      </p>

      {drafts.isError ? (
        <QueryError message={drafts.error.message} onRetry={() => void drafts.refetch()} />
      ) : drafts.isPending ? (
        <TableSkeleton columns={COLUMNS} rows={SKELETON_ROWS} />
      ) : drafts.data.data.length === 0 ? (
        <p className="body-sm text-muted">Tidak ada draf yang menunggu.</p>
      ) : (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Nama</th>
                <th scope="col">Email</th>
                <th scope="col">Cabang</th>
                <th scope="col">Paket</th>
                <th scope="col">Dibuat</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {drafts.data.data.map((row) => (
                <tr key={row.studentId}>
                  <td className="text-ink">{row.name}</td>
                  <td>{row.email ?? DASH}</td>
                  <td>{row.branch ?? DASH}</td>
                  <td>{row.packageName ?? DASH}</td>
                  <td className="tabular">{formatDate(row.registeredAt)}</td>
                  <td>
                    {row.studentId === activeId ? (
                      <span className="caption text-muted">Sedang dibuka</span>
                    ) : (
                      <a
                        className="btn btn-ghost btn-sm"
                        href={`/staff/registrations?id=${row.studentId}`}
                      >
                        Lanjutkan
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
