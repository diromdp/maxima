"use client"

import { ArrowDown01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Fragment, useState } from "react"

import { Notice } from "@/src/components/ui/Notice"
import { DASH, formatDate } from "@/src/lib/format"
import { formatMoney } from "@/src/lib/money"
import { notify } from "@/src/lib/notify"

import {
  type BoardStudent,
  type DetailRow,
  detailRows,
  gateShortfall,
  gateThreshold,
  outstanding,
  type ServiceId,
  STATE_BADGE,
} from "./sample"
import { ServiceWorkModal, type WorkPatch } from "./ServiceWorkModal"

export function ServiceDetail({ student, readOnly }: { student: BoardStudent; readOnly: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [patches, setPatches] = useState<Partial<Record<ServiceId, WorkPatch>>>({})
  const [editing, setEditing] = useState<DetailRow | null>(null)
  const rows = detailRows(student).map((row) => ({ ...row, ...patches[row.id] }))

  const lockedHint = (id: ServiceId) => {
    const threshold = gateThreshold(student, id)
    const shortfall = gateShortfall(student, id)
    if (!threshold || !shortfall) return "Gerbang belum terbuka"
    return `Terbuka setelah pembayaran mencapai ${formatMoney(threshold)}, kurang ${formatMoney(shortfall)}`
  }

  const saveWork = (id: ServiceId, patch: WorkPatch) => {
    setPatches((current) => ({ ...current, [id]: patch }))
    notify.success(`Pengerjaan ${rows.find((row) => row.id === id)?.label} tersimpan.`)
  }

  return (
    <div className="stack stack-lg">
      <section className="card">
        <dl className="row row-wrap" style={{ gap: 24, margin: 0 }}>
          {[
            { label: "NIS", value: student.nis },
            { label: "Paket", value: student.packageName },
            { label: "Cabang", value: student.branch },
            { label: "Total Masuk", value: formatMoney(student.paid) },
            { label: "Sisa Pembayaran", value: formatMoney(outstanding(student)), tone: "danger" },
          ].map(({ label, value, tone }) => (
            <div key={label} className="stack" style={{ gap: 2 }}>
              <dt className="caption text-muted">{label}</dt>
              <dd
                className={`body-sm tabular${tone ? ` text-${tone}` : ""}`}
                style={{ fontWeight: 600, margin: 0 }}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {student.onLeave && (
        <Notice tone="warning">
          Siswa berstatus Cuti. Gerbang tetap terbuka mengikuti pembayaran, pengerjaan layanan
          berhenti sampai ia kembali.
        </Notice>
      )}

      <section className="card stack">
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Layanan</th>
                <th scope="col">Status</th>
                <th scope="col">Progres / Aksi yang Perlu</th>
                <th scope="col">PIC</th>
                <th scope="col">Tgl Mulai</th>
                <th scope="col">Tgl Selesai</th>
                <th scope="col" style={{ minWidth: 140 }}>
                  Catatan
                </th>
                <th scope="col">Hasil</th>
                {!readOnly && (
                  <th scope="col" style={{ textAlign: "right" }}>
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const open = openId === row.id
                return (
                  <Fragment key={row.id}>
                    <tr>
                      <td style={{ fontWeight: 600 }}>
                        {row.steps ? (
                          <button
                            type="button"
                            className="table-sort"
                            aria-expanded={open}
                            onClick={() => setOpenId(open ? null : row.id)}
                          >
                            <HugeiconsIcon
                              icon={open ? ArrowDown01Icon : ArrowRight01Icon}
                              size={14}
                              strokeWidth={1.5}
                            />
                            {row.label}
                          </button>
                        ) : (
                          row.label
                        )}
                      </td>
                      <td>
                        <span className={`badge ${STATE_BADGE[row.state]}`}>{row.state}</span>
                      </td>
                      <td className="wrap">
                        {row.state === "Belum Terbuka" ? (
                          <span className="caption text-muted">{lockedHint(row.id)}</span>
                        ) : (
                          (row.progress ?? DASH)
                        )}
                      </td>
                      <td>{row.pic ?? DASH}</td>
                      <td className="tabular">
                        {row.startedAt ? formatDate(row.startedAt) : DASH}
                      </td>
                      <td className="tabular">
                        {row.finishedAt ? formatDate(row.finishedAt) : DASH}
                      </td>
                      <td className="wrap">{row.note ?? DASH}</td>
                      <td>
                        {row.result ? (
                          <a className="link" href={row.result.href}>
                            {row.result.label}
                          </a>
                        ) : (
                          DASH
                        )}
                      </td>
                      {!readOnly && (
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            disabled={row.state === "Belum Terbuka"}
                            title={row.state === "Belum Terbuka" ? lockedHint(row.id) : undefined}
                            onClick={() => setEditing(row)}
                          >
                            Ubah
                          </button>
                        </td>
                      )}
                    </tr>

                    {open && row.steps && (
                      <tr>
                        <td colSpan={readOnly ? 8 : 9}>
                          <div className="row row-wrap" style={{ gap: 12 }}>
                            {row.steps.map((step) => (
                              <span key={step.label} className="row" style={{ gap: 6 }}>
                                <span className={`badge ${STATE_BADGE[step.state]}`}>
                                  {step.state}
                                </span>
                                <span className="caption">{step.label}</span>
                              </span>
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

        <p className="caption text-muted">
          Status gerbang dihitung dari pembayaran dan tidak dapat diubah dari halaman ini. Ubah
          mengisi progres, PIC, tanggal, catatan, dan hasil; gerbang Belum Terbuka tidak bisa
          dikerjakan.
        </p>
      </section>

      <ServiceWorkModal
        key={editing?.id ?? "closed"}
        row={editing}
        studentName={student.name}
        onClose={() => setEditing(null)}
        onSave={saveWork}
      />
    </div>
  )
}
