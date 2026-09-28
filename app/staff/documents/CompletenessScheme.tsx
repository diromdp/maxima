"use client"

import { useMutation } from "@tanstack/react-query"
import Link from "next/link"

import { remindDocument } from "@/src/entities/document/actions"
import {
  completenessTone,
  type DocumentDetail,
  type DocumentItem,
  GROUP_TITLES,
  STATE_BADGE,
} from "@/src/entities/document/schema"
import { previewPresigned } from "@/src/lib/api/download"
import { formatDate } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"

type Group = DocumentDetail["groups"][number]

const AWAITING_UPLOAD: ReadonlySet<DocumentItem["state"]> = new Set(["Belum Diunggah", "Ditolak"])

const GROUP_NOTES: Partial<Record<Group["group"], string>> = {
  "Hasil Layanan":
    "Diproduksi Maxima; Admission mengunggahnya di sini atau di halaman Layanan, dan siswa hanya mengunduh.",
  "Dari Betrieb":
    "Diunggah Admission di halaman ini atau di halaman Visa & Penempatan dan langsung berstatus Lengkap tanpa verifikasi. Sebelum Dapat Vertrag berkasnya opsional dan baru dihitung setelah diunggah.",
}

const producedElsewhere = (group: Group["group"], nis: string) =>
  group === "Hasil Layanan"
    ? { href: `/staff/services/${encodeURIComponent(nis)}`, label: "Dikerjakan di Layanan" }
    : {
        href: `/staff/visa-placement/${encodeURIComponent(nis)}`,
        label: "Diunggah di Visa & Penempatan",
      }

export function CompletenessScheme({
  detail,
  canDecide,
  canUploadResults,
  onVerify,
  onReject,
  onUpload,
}: {
  detail: DocumentDetail
  canDecide: boolean
  canUploadResults: boolean
  onVerify: (item: DocumentItem) => void
  onReject: (item: DocumentItem) => void
  onUpload: (item: DocumentItem) => void
}) {
  const { nis, name: studentName } = detail.summary
  const reminder = useMutation({
    mutationFn: (item: DocumentItem) => remindDocument(nis, item.code ?? ""),
    onSuccess: (result, item) =>
      result.ok
        ? notify.success(
            `Pengingat unggah ${item.name} untuk ${studentName} tercatat. Surelnya terkirim paling banyak sekali sehari per berkas.`,
          )
        : notify.error(result.message),
    onError: () => notify.error("Pengingat gagal dikirim. Periksa jaringan lalu coba lagi."),
  })

  const renderActions = (group: Group, item: DocumentItem) => {
    const viewButton = item.objectKey && (
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => void previewPresigned("/downloads/presign", { key: item.objectKey })}
      >
        Lihat
      </button>
    )
    const isUploadable =
      group.group === "Dari Betrieb"
        ? canDecide
        : group.group === "Hasil Layanan" && canUploadResults
    if (isUploadable && item.code) {
      return (
        <>
          {viewButton}
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onUpload(item)}>
            {item.objectKey ? "Ganti" : "Unggah"}
          </button>
        </>
      )
    }
    if (item.producer !== "student") {
      if (item.state === "Lengkap") return viewButton
      const target = producedElsewhere(group.group, nis)
      return (
        <Link href={target.href} className="caption link">
          {target.label}
        </Link>
      )
    }
    if (canDecide && item.state === "Perlu Verifikasi") {
      return (
        <>
          {viewButton}
          <button type="button" className="btn btn-primary btn-sm" onClick={() => onVerify(item)}>
            Verifikasi
          </button>
          <button type="button" className="btn btn-error btn-sm" onClick={() => onReject(item)}>
            Tolak
          </button>
        </>
      )
    }
    if (canDecide && AWAITING_UPLOAD.has(item.state) && item.code) {
      const isSending = reminder.isPending && reminder.variables.code === item.code
      return (
        <>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={reminder.isPending}
            onClick={() => reminder.mutate(item)}
          >
            {isSending ? "Mengirim..." : "Ingatkan"}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onUpload(item)}>
            Unggah
          </button>
        </>
      )
    }
    if (canDecide && item.state === "Lengkap" && item.code) {
      return (
        <>
          {viewButton}
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onUpload(item)}>
            Ganti
          </button>
        </>
      )
    }
    return viewButton
  }

  return (
    <div className="grid-2" style={{ alignItems: "start" }}>
      {detail.groups.map((group) => {
        const note = GROUP_NOTES[group.group]
        return (
          <section key={group.group} className="card stack">
            <div className="row row-between" style={{ alignItems: "flex-start", gap: 8 }}>
              <h3 className="h6">{GROUP_TITLES[group.group]}</h3>
              <span className={`badge tabular ${completenessTone(group)}`}>
                {group.complete}/{group.total}
              </span>
            </div>

            {note && <span className="caption text-muted">{note}</span>}

            {group.items.length === 0 ? (
              <span className="body-sm text-muted">
                Tidak ada berkas rumpun ini untuk paket siswa.
              </span>
            ) : (
              <ul className="list-rows" style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {group.items.map((item) => (
                  <li
                    key={item.code ?? item.documentId ?? item.name}
                    className="stack"
                    style={{ gap: 6, paddingBlock: 10 }}
                  >
                    <div className="row row-between" style={{ gap: 8, alignItems: "flex-start" }}>
                      <span className="stack min-w-0" style={{ gap: 0 }}>
                        <span className="body-sm break-words">
                          {item.name}
                          {item.isOptional && (
                            <span className="caption text-muted"> (opsional)</span>
                          )}
                        </span>
                        {item.uploadedAt && (
                          <span className="caption text-muted">
                            {item.originalName ?? "Berkas"} · {formatDate(item.uploadedAt)}
                          </span>
                        )}
                        {item.state === "Ditolak" && item.rejectReason && (
                          <span className="caption text-danger">{item.rejectReason}</span>
                        )}
                      </span>
                      <span
                        className={`badge shrink-0 whitespace-nowrap ${STATE_BADGE[item.state]}`}
                      >
                        {item.state}
                      </span>
                    </div>
                    <div className="row row-wrap" style={{ gap: 4 }}>
                      {renderActions(group, item)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
