"use client"

import { Group, Loader, Modal, Overlay, Portal } from "@mantine/core"
import { Dropzone } from "@mantine/dropzone"
import { type ReactNode, useState } from "react"

import { DropzoneBody } from "@/src/components/ui/DropzoneBody"
import { Notice } from "@/src/components/ui/Notice"
import type { ActionResult } from "@/src/lib/api/client"
import { base64Of, type ImportReport, type ImportStep } from "@/src/lib/import-file"
import { notify } from "@/src/lib/notify"

const MAX_XLSX_BYTES = 2_000_000
const XLSX_ACCEPT = {
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
}
const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

const titleCase = (text: string) => text.replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())

export type ImportModalProps = {
  title: string
  templateUrl: string
  steps: readonly ReactNode[]
  noun: string
  run: (xlsx: string, step: ImportStep) => Promise<ActionResult<ImportReport>>
  onImported: () => Promise<unknown>
  onClose: () => void
}

export function ImportModal({
  title,
  templateUrl,
  steps,
  noun,
  run,
  onImported,
  onClose,
}: ImportModalProps) {
  const [file, setFile] = useState<{ name: string; xlsx: string } | null>(null)
  const [report, setReport] = useState<ImportReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingStep, setPendingStep] = useState<ImportStep | null>(null)
  const isDone = report !== null && report.written > 0

  async function send(xlsx: string, step: ImportStep) {
    setPendingStep(step)
    setError(null)
    const result = await run(xlsx, step).finally(() => setPendingStep(null))
    if (!result.ok) {
      setError(result.message)
      return
    }
    setReport(result.data)
    if (step === "commit") {
      notify.success(`${result.data.written} ${noun} berhasil diimpor.`)
      await onImported()
    }
  }

  async function handleDrop(files: File[]) {
    const picked = files[0]
    if (!picked) return
    const xlsx = await base64Of(picked)
    setFile({ name: picked.name, xlsx })
    setReport(null)
    await send(xlsx, "preview")
  }

  const close = pendingStep ? () => undefined : onClose
  const waitMessage =
    pendingStep === "commit"
      ? `Mengimpor data ${noun}. Jangan tutup atau muat ulang halaman ini sampai selesai.`
      : "Memeriksa isi berkas..."

  return (
    <Modal opened onClose={close} title={title} size="lg" styles={TITLE_STYLE}>
      <div className="stack stack-lg">
        <ol className="body-sm stack" style={{ gap: 4, paddingLeft: 20, listStyle: "decimal" }}>
          {steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>

        <a href={templateUrl} className="btn btn-secondary btn-sm" style={{ alignSelf: "start" }}>
          Unduh Templat Excel
        </a>

        {!isDone && (
          <Dropzone
            onDrop={handleDrop}
            onReject={() => setError("Berkas harus Excel (.xlsx) dan paling besar 2 MB.")}
            accept={XLSX_ACCEPT}
            maxSize={MAX_XLSX_BYTES}
            maxFiles={1}
            multiple={false}
            disabled={pendingStep !== null}
          >
            <DropzoneBody
              prompt={file ? file.name : undefined}
              rule={`Excel (.xlsx) dari templat, paling besar 2 MB. Data ${noun} yang sudah ada dilewati.`}
            />
          </Dropzone>
        )}

        {error && <Notice tone="danger">{error}</Notice>}
        {report && <ImportSummary report={report} />}

        <Group justify="flex-end">
          <button type="button" className="btn btn-secondary" onClick={close}>
            {isDone ? "Tutup" : "Batal"}
          </button>
          {!isDone && (
            <button
              type="button"
              className="btn btn-primary"
              disabled={!file || !report || report.accepted === 0 || pendingStep !== null}
              onClick={() => file && send(file.xlsx, "commit")}
            >
              {report && report.accepted > 0
                ? `Impor ${report.accepted} ${titleCase(noun)}`
                : "Impor"}
            </button>
          )}
        </Group>
      </div>

      {pendingStep && (
        <Portal>
          <Overlay fixed center zIndex={1000} backgroundOpacity={0.55} blur={2}>
            <div className="card stack items-center" role="status" style={{ maxWidth: 360 }}>
              <Loader />
              <span className="body-sm text-center">{waitMessage}</span>
            </div>
          </Overlay>
        </Portal>
      )}
    </Modal>
  )
}

function ImportSummary({ report }: { report: ImportReport }) {
  const counts = [
    [report.written > 0 ? "Diimpor" : "Siap diimpor", report.written || report.accepted],
    ["Sudah ada, dilewati", report.skipped.length],
    ["Ditolak", report.rejected.length],
  ] as const

  return (
    <div className="stack">
      <div className="grid-3">
        {counts.map(([label, count]) => (
          <div key={label} className="card-soft stack" style={{ gap: 2, padding: 12 }}>
            <span className="caption text-muted">{label}</span>
            <span className="h5 tabular">{count}</span>
          </div>
        ))}
      </div>
      {report.rejected.length > 0 && (
        <Notice tone="warning" title="Baris yang ditolak">
          <p className="body-sm">
            Perbaiki baris ini di berkas yang sama lalu unggah ulang. Baris lain tetap dapat diimpor
            sekarang.
          </p>
          <ul
            className="list-rows body-sm"
            style={{ maxHeight: 240, overflowY: "auto", marginTop: 8 }}
          >
            {report.rejected.map((issue) => (
              <li key={issue.row}>
                <strong>Baris {issue.row}:</strong> {issue.reasons.join(" ")}
              </li>
            ))}
          </ul>
        </Notice>
      )}
    </div>
  )
}
