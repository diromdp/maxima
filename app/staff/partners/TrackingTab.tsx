"use client"

import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Select, TextInput } from "@mantine/core"
import { Fragment, useState } from "react"

import { formatDate } from "@/src/lib/format"

import { StatusBadge } from "./ApplicationsTab"
import { APPLICATION_STATUSES, APPLICATIONS, partnerById, PARTNERS, trackingRows } from "./sample"

export function TrackingTab() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [openNis, setOpenNis] = useState<string | null>(null)

  const rows = trackingRows(APPLICATIONS).filter(
    (row) =>
      (!status || row.latest.status === status) &&
      (!partnerId || row.latest.partnerId === partnerId) &&
      (query === "" || `${row.studentName} ${row.nis}`.toLowerCase().includes(query.toLowerCase())),
  )

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="row row-wrap" style={{ gap: 8 }}>
          <TextInput
            aria-label="Cari siswa"
            placeholder="Cari nama siswa"
            size="sm"
            w={220}
            leftSection={<HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.5} />}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
          <Select
            aria-label="Saring status"
            placeholder="Status: Semua"
            size="sm"
            w={240}
            data={[...APPLICATION_STATUSES]}
            value={status}
            onChange={setStatus}
            clearable
          />
          <Select
            aria-label="Saring partner"
            placeholder="Partner: Semua"
            size="sm"
            w={200}
            data={PARTNERS.map((partner) => ({ value: partner.id, label: partner.shortName }))}
            value={partnerId}
            onChange={setPartnerId}
            clearable
          />
        </div>
        <span className="badge badge-neutral tabular">{rows.length} siswa</span>
      </div>

      <span className="caption text-muted">
        Rekapitulasi progres seluruh siswa kandidat yang diajukan ke partner: satu baris satu siswa,
        status dari pengajuan terbarunya. Seluruhnya turunan tab Pengajuan, tidak ada yang diketik
        di sini.
      </span>

      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Nama Siswa</th>
              <th>Partner</th>
              <th>Posisi</th>
              <th>Status Progres (11 Status)</th>
              <th>Tanggal Lapor</th>
              <th>PIC Admission</th>
              <th style={{ textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="text-muted">
                  Tidak ada siswa yang cocok dengan saringan.
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const isOpen = openNis === row.nis
              return (
                <Fragment key={row.nis}>
                  <tr>
                    <td style={{ fontWeight: 600 }}>{row.studentName}</td>
                    <td>{partnerById(row.latest.partnerId).shortName}</td>
                    <td>{row.latest.position}</td>
                    <td>
                      <StatusBadge status={row.latest.status} />
                    </td>
                    <td>{formatDate(row.latest.date)}</td>
                    <td>{row.latest.admissionPic}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        aria-expanded={isOpen}
                        onClick={() => setOpenNis(isOpen ? null : row.nis)}
                      >
                        {isOpen ? "Tutup" : `Lihat (${row.history.length})`}
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={7} className="wrap" style={{ paddingTop: 0 }}>
                        <div className="card-soft stack stack-sm">
                          <span className="label">Riwayat pengajuan {row.studentName}</span>
                          {row.history.map((application) => (
                            <div
                              key={application.id}
                              className="row row-wrap"
                              style={{ gap: 12, alignItems: "flex-start" }}
                            >
                              <span className="caption text-muted tabular" style={{ minWidth: 90 }}>
                                {formatDate(application.date)}
                              </span>
                              <span className="body-sm" style={{ minWidth: 140 }}>
                                {partnerById(application.partnerId).shortName} ·{" "}
                                {application.position}
                              </span>
                              <StatusBadge status={application.status} />
                              <span className="caption text-muted">{application.partnerNote}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
