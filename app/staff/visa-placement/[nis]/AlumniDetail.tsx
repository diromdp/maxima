"use client"

import { Cancel01Icon, Download04Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useState } from "react"

import { Notice } from "@/src/components/ui/Notice"
import { DASH, formatDateLong } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"

import {
  ALUMNI_STATUS_BADGE,
  type Alumnus,
  alumnusStatus,
  DEPARTURE_CHECKLIST,
  type PlacementData,
  VISA_STATUS_BADGE,
  type VisaData,
  visaStatus,
} from "../sample"
import { AlumniEditModal, type EditSection } from "./AlumniEditModal"

const dateOrDash = (value: string | null) => (value ? formatDateLong(value) : DASH)
const textOrDash = (value: string | null) => (value && value !== "" ? value : DASH)

function Panel({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <h2 className="h6">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function Rows({ rows }: { rows: readonly { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="list-rows" style={{ margin: 0 }}>
      {rows.map(({ label, value }) => (
        <div key={label} className="row row-between" style={{ gap: 16, paddingBlock: 10 }}>
          <dt className="body-sm text-muted">{label}</dt>
          <dd className="body-sm" style={{ margin: 0, fontWeight: 600, textAlign: "right" }}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function AlumniDetail({ initial, readOnly }: { initial: Alumnus; readOnly: boolean }) {
  const [alumnus, setAlumnus] = useState(initial)
  const [section, setSection] = useState<EditSection | null>(null)
  const status = alumnusStatus(alumnus)
  const visa = visaStatus(alumnus.visa)
  const checked = alumnus.checklist.length
  const proposalCount = Object.keys(alumnus.proposal ?? {}).length

  const save = (edited: EditSection, nextVisa: VisaData, nextPlacement: PlacementData) => {
    setAlumnus((current) => ({
      ...current,
      visa: edited === "visa" ? nextVisa : current.visa,
      placement: edited === "placement" ? nextPlacement : current.placement,
      proposal: null,
    }))
    notify.success(edited === "visa" ? "Proses visa tersimpan." : "Data penempatan tersimpan.")
  }

  const editButton = (target: EditSection) =>
    readOnly ? null : (
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSection(target)}>
        Ubah
      </button>
    )

  return (
    <div className="stack stack-lg">
      <section className="card">
        <dl className="row row-wrap" style={{ gap: 24, margin: 0 }}>
          {[
            { label: "NIS", value: alumnus.nis },
            { label: "No Kontrak", value: alumnus.contractNumber },
            { label: "Cabang", value: alumnus.branch },
            { label: "Program", value: `${alumnus.program} ${alumnus.intakeYear}` },
            { label: "Jurusan", value: alumnus.field },
          ].map(({ label, value }) => (
            <div key={label} className="stack" style={{ gap: 2 }}>
              <dt className="caption text-muted">{label}</dt>
              <dd className="body-sm tabular" style={{ fontWeight: 600, margin: 0 }}>
                {value}
              </dd>
            </div>
          ))}
          <div className="stack" style={{ gap: 2 }}>
            <dt className="caption text-muted">Status</dt>
            <dd style={{ margin: 0 }}>
              <span className={`badge ${ALUMNI_STATUS_BADGE[status]}`}>{status}</span>
            </dd>
          </div>
        </dl>
      </section>

      {proposalCount > 0 && !readOnly && (
        <Notice tone="warning" title="Ada usulan dari siswa">
          {alumnus.name} mengisi {proposalCount} isian di portalnya yang belum diverifikasi. Buka
          Ubah pada panel terkait; usulannya ditulis di bawah tiap kolom.
        </Notice>
      )}

      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="stack">
          <Panel title="I. Proses Visa (Keputusan Jerman)" action={editButton("visa")}>
            <Rows
              rows={[
                { label: "Tanggal Pengajuan Visa", value: dateOrDash(alumnus.visa.appliedAt) },
                {
                  label: "Tanggal Wawancara Kedutaan",
                  value: dateOrDash(alumnus.visa.interviewAt),
                },
                { label: "Tanggal Visa Terbit", value: dateOrDash(alumnus.visa.issuedAt) },
                { label: "Jenis Visa", value: textOrDash(alumnus.visa.type) },
                { label: "Masa Berlaku Visa", value: textOrDash(alumnus.visa.validity) },
                {
                  label: "Status",
                  value: <span className={`badge ${VISA_STATUS_BADGE[visa]}`}>{visa}</span>,
                },
              ]}
            />
          </Panel>

          <Panel title="II. Data Penempatan (Jerman)" action={editButton("placement")}>
            <Rows
              rows={[
                { label: "Perusahaan / Betrieb", value: textOrDash(alumnus.placement.company) },
                { label: "Sekolah (Berufsschule)", value: textOrDash(alumnus.placement.school) },
                { label: "Jurusan Ausbildung", value: textOrDash(alumnus.placement.major) },
                { label: "Kota / Bundesland", value: textOrDash(alumnus.placement.cityState) },
                {
                  label: "Tanggal Mulai Kontrak",
                  value: dateOrDash(alumnus.placement.contractStart),
                },
                {
                  label: "Tanggal Selesai Kontrak",
                  value: dateOrDash(alumnus.placement.contractEnd),
                },
                {
                  label: "Tanggal Keberangkatan",
                  value: dateOrDash(alumnus.placement.departureAt),
                },
              ]}
            />
            <span className="caption text-muted">
              Mengisi Tanggal Keberangkatan menyalakan status Alumni secara otomatis.
            </span>
          </Panel>
        </div>

        <div className="stack">
          <Panel
            title="III. Berkas Alumni"
            action={
              <Link href={`/staff/documents/${alumnus.nis}`} className="btn btn-ghost btn-sm">
                Buka Dokumen
              </Link>
            }
          >
            <span className="caption text-muted">
              Dibaca dari halaman Dokumen; tidak ada unggahan di sini.
            </span>
            <ul className="list-rows" style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {alumnus.files.map((file) => (
                <li
                  key={file.label}
                  className="row row-between"
                  style={{ gap: 12, paddingBlock: 8 }}
                >
                  <span className="body-sm">{file.label}</span>
                  {file.fileName ? (
                    <button
                      type="button"
                      className="link row"
                      style={{
                        fontSize: 14,
                        gap: 4,
                        background: "none",
                        border: 0,
                        padding: 0,
                        cursor: "pointer",
                      }}
                      onClick={() => notify.info(`${file.fileName} disiapkan untuk diunduh.`)}
                    >
                      <HugeiconsIcon icon={Download04Icon} size={14} strokeWidth={1.5} />
                      {file.fileName}
                    </button>
                  ) : (
                    <span className="badge badge-tindakan">Belum ada</span>
                  )}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title="IV. Checklist Mandiri Keberangkatan"
            action={
              <span
                className={`badge tabular ${checked === DEPARTURE_CHECKLIST.length ? "badge-beres" : "badge-berjalan"}`}
              >
                {checked}/{DEPARTURE_CHECKLIST.length}
              </span>
            }
          >
            <Notice tone="warning">
              Data ini diisi sendiri oleh siswa melalui Portal Siswa. Di sini hanya dibaca, tidak
              dapat dicentang.
            </Notice>
            <ul className="list-rows" style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {DEPARTURE_CHECKLIST.map((item) => {
                const isChecked = alumnus.checklist.includes(item)
                return (
                  <li key={item} className="row" style={{ gap: 10, paddingBlock: 8 }}>
                    <span className={isChecked ? "text-success" : "text-faint"} aria-hidden>
                      <HugeiconsIcon
                        icon={isChecked ? Tick02Icon : Cancel01Icon}
                        size={16}
                        strokeWidth={2}
                      />
                    </span>
                    <span className={`body-sm ${isChecked ? "" : "text-muted"}`}>{item}</span>
                    <span className="sr-only">{isChecked ? "sudah" : "belum"}</span>
                  </li>
                )
              })}
            </ul>
          </Panel>
        </div>
      </div>

      <AlumniEditModal
        key={`${section ?? "closed"}-${alumnus.nis}`}
        alumnus={alumnus}
        section={section}
        onClose={() => setSection(null)}
        onSave={save}
      />
    </div>
  )
}
