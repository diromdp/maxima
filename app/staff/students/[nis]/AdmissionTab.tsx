"use client"

import { useState } from "react"

import { admissionAccountQuery, studentAdmissionQuery } from "@/src/entities/student/queries"
import type { GateStatus, StudentAdmission } from "@/src/entities/student/schema"
import { ApiError } from "@/src/lib/api/errors"
import { readApi } from "@/src/lib/api/read"
import { useRead } from "@/src/lib/api/use-read"
import { formatDate } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"

import { EmptyText, FieldValue, Panel, TabBody } from "./Panel"

const DASH = "-"

const SERVICE_TONE: Readonly<Record<GateStatus, string>> = {
  Selesai: "text-success",
  Dikerjakan: "text-warning",
  Terbuka: "text-info",
  "Belum Terbuka": "text-muted",
}

const FAILED_APPLICATIONS: ReadonlySet<string> = new Set([
  "Gagal Interview - Partner",
  "Gagal Interview - Betrieb",
  "Tidak Lanjut Proses",
])

const applicationTone = (status: string) =>
  status === "Dapat Vertrag"
    ? "badge-beres"
    : FAILED_APPLICATIONS.has(status)
      ? "badge-tindakan"
      : "badge-berjalan"

const PLACEMENT_FIELDS: readonly { key: string; label: string; isDate?: boolean }[] = [
  { key: "company", label: "Perusahaan / Betrieb" },
  { key: "school", label: "Sekolah (Berufsschule)" },
  { key: "fieldOfStudy", label: "Jurusan Ausbildung" },
  { key: "city", label: "Kota" },
  { key: "visaIssuedOn", label: "Visa Terbit", isDate: true },
  { key: "departureOn", label: "Tanggal Keberangkatan", isDate: true },
]

function StatusLabel({ status }: { status: GateStatus }) {
  return <span className={`label ${SERVICE_TONE[status]}`}>{status}</span>
}

function AdmissionAccount({ nis, email }: { nis: string; email: string | null }) {
  const [password, setPassword] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const reveal = async () => {
    setIsLoading(true)
    try {
      setPassword((await readApi(admissionAccountQuery(nis))).password)
    } catch (error) {
      if (error instanceof ApiError) notify.error(error.message)
      else throw error
    } finally {
      setIsLoading(false)
    }
  }

  if (!email) return <EmptyText>Siswa belum punya akun admission.</EmptyText>
  return (
    <div className="stack stack-sm">
      <FieldValue label="Email" value={email} />
      <div className="row row-between" style={{ gap: 8 }}>
        <FieldValue label="Kata sandi" value={password ?? "••••••••"} />
        {password === null && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={isLoading}
            onClick={() => void reveal()}
          >
            Tampilkan
          </button>
        )}
      </div>
      <p className="caption text-muted">Setiap pembukaan kata sandi tercatat di Log Aktivitas.</p>
    </div>
  )
}

function AdmissionView({ nis, admission }: { nis: string; admission: StudentAdmission }) {
  const notes = admission.applications.filter((a) => a.partnerNote || a.admissionNote)

  return (
    <div className="grid-main-aside">
      <div className="stack">
        <Panel title={`Progres Pengajuan Partner (${admission.activeApplications} aktif)`}>
          {admission.applications.length === 0 ? (
            <EmptyText>Belum ada pengajuan partner.</EmptyText>
          ) : (
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Partner</th>
                    <th scope="col">Posisi</th>
                    <th scope="col">Status</th>
                    <th scope="col">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {admission.applications.map((application) => (
                    <tr key={application.id}>
                      <td style={{ fontWeight: 600 }}>{application.partner.name}</td>
                      <td>{application.position ?? DASH}</td>
                      <td>
                        <span className={`badge ${applicationTone(application.status)}`}>
                          {application.status}
                        </span>
                      </td>
                      <td className="tabular">{formatDate(application.appliedOn)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Riwayat Latihan Wawancara (Interview)">
          {admission.practices.length === 0 ? (
            <EmptyText>Belum ada latihan wawancara.</EmptyText>
          ) : (
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Tanggal</th>
                    <th scope="col">Posisi</th>
                    <th scope="col">Trainer</th>
                    <th scope="col">Status</th>
                    <th scope="col">PIC</th>
                  </tr>
                </thead>
                <tbody>
                  {admission.practices.map((practice) => (
                    <tr key={practice.id}>
                      <td className="tabular">{formatDate(practice.date)}</td>
                      <td>{practice.position ?? DASH}</td>
                      <td>{practice.trainer?.name ?? DASH}</td>
                      <td>
                        <span className="badge">{practice.result ?? practice.status}</span>
                      </td>
                      <td>{practice.trainer?.name ?? DASH}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <div className="grid-2">
          <Panel title="Catatan Partner">
            {notes.some((a) => a.partnerNote) ? (
              notes
                .filter((a) => a.partnerNote)
                .map((a) => (
                  <p key={a.id} className="body-sm text-muted">
                    <strong>{a.partner.name}:</strong> {a.partnerNote}
                  </p>
                ))
            ) : (
              <EmptyText>Belum ada catatan partner.</EmptyText>
            )}
          </Panel>
          <Panel title="Catatan Admission">
            {notes.some((a) => a.admissionNote) ? (
              notes
                .filter((a) => a.admissionNote)
                .map((a) => (
                  <p key={a.id} className="body-sm text-muted">
                    <strong>{a.partner.name}:</strong> {a.admissionNote}
                  </p>
                ))
            ) : (
              <EmptyText>Belum ada catatan admission.</EmptyText>
            )}
          </Panel>
        </div>
      </div>

      <div className="stack">
        <Panel title="Status Progres Layanan">
          <div className="list-rows">
            {admission.services.map((service) =>
              service.steps ? (
                <details key={service.code}>
                  <summary
                    className="row row-between"
                    style={{ cursor: "pointer", listStyle: "none" }}
                  >
                    <span className="body-sm">{service.name}</span>
                    <StatusLabel status={service.status} />
                  </summary>
                  <div className="stack stack-sm" style={{ paddingTop: 8, paddingLeft: 16 }}>
                    {service.steps.map((step) => (
                      <div key={step.step} className="row row-between">
                        <span className="body-sm">{step.name}</span>
                        <StatusLabel status={step.state} />
                      </div>
                    ))}
                  </div>
                </details>
              ) : (
                <div key={service.code} className="row row-between">
                  <span className="body-sm">{service.name}</span>
                  <StatusLabel status={service.status} />
                </div>
              ),
            )}
          </div>
        </Panel>

        <Panel title="Visa & Penempatan">
          {admission.placement ? (
            <div className="grid-2">
              <FieldValue label="Status" value={admission.placement.status} />
              <FieldValue label="Status Visa" value={admission.placement.visaStatus} />
              {PLACEMENT_FIELDS.map((field) => {
                const value = admission.placement?.values[field.key] ?? null
                return (
                  <FieldValue
                    key={field.key}
                    label={field.label}
                    value={value === null ? DASH : field.isDate ? formatDate(value) : value}
                  />
                )
              })}
            </div>
          ) : (
            <EmptyText>Belum ada data visa dan penempatan saat ini.</EmptyText>
          )}
        </Panel>

        <Panel title="Akun Admission">
          <AdmissionAccount nis={nis} email={admission.admissionEmail} />
        </Panel>
      </div>
    </div>
  )
}

export function AdmissionTab({ nis }: { nis: string }) {
  const admission = useRead(studentAdmissionQuery(nis))
  return (
    <TabBody query={admission}>{(data) => <AdmissionView nis={nis} admission={data} />}</TabBody>
  )
}
