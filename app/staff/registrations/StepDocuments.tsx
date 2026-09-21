import { FileButton } from "@mantine/core"

import { formatFileSize } from "@/src/lib/format"

import {
  ACCEPTED_DOCUMENT_TYPES,
  type DocumentKey,
  DOCUMENTS,
  MAX_DOCUMENT_SIZE,
  REQUIRED_DOCUMENT_COUNT,
} from "../../(public)/register/data"

export type Documents = Readonly<Record<DocumentKey, File | null>>

export const EMPTY_DOCUMENTS: Documents = {
  pasFoto: null,
  aktaKelahiran: null,
  kartuKeluarga: null,
  ktp: null,
  ijazah: null,
  transkrip: null,
  paspor: null,
  suratKontrak: null,
}

export const uploadedRequiredCount = (documents: Documents) =>
  DOCUMENTS.filter((d) => d.required && documents[d.key]).length

const ACCEPT = ACCEPTED_DOCUMENT_TYPES.join(",")

export function StepDocuments({
  documents,
  onChange,
}: {
  documents: Documents
  onChange: (key: DocumentKey, file: File | null) => void
}) {
  const uploaded = uploadedRequiredCount(documents)

  return (
    <div className="stack">
      <div className="row row-between row-wrap">
        <span className="body-sm text-muted">
          Enam dokumen wajib lengkap sebelum pendaftaran diselesaikan. Paspor dan Surat Kontrak
          boleh menyusul.
        </span>
        <span
          className={`badge ${uploaded === REQUIRED_DOCUMENT_COUNT ? "badge-beres" : "badge-berjalan"} tabular`}
        >
          {uploaded} dari {REQUIRED_DOCUMENT_COUNT} Dokumen Terunggah
        </span>
      </div>

      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Nama Dokumen</th>
              <th scope="col">Status Verifikasi</th>
              <th scope="col">Pratinjau</th>
              <th scope="col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {DOCUMENTS.map((doc) => {
              const file = documents[doc.key]
              const tooBig = file !== null && file.size > MAX_DOCUMENT_SIZE
              return (
                <tr key={doc.key}>
                  <td>
                    <div className="stack" style={{ gap: 0 }}>
                      <span className="text-ink">{doc.label}</span>
                      <span className="caption text-muted">
                        {doc.required ? "Wajib" : "Opsional"}
                      </span>
                    </div>
                  </td>
                  <td>
                    {file ? (
                      <span className={`badge ${tooBig ? "badge-tindakan" : "badge-berjalan"}`}>
                        {tooBig ? "Terlalu besar" : "Menunggu Verifikasi"}
                      </span>
                    ) : (
                      <span className="badge badge-terkunci">Belum Diunggah</span>
                    )}
                  </td>
                  <td>
                    {file ? (
                      <span className="caption tabular">
                        {file.name} · {formatFileSize(file.size)}
                      </span>
                    ) : (
                      <span className="caption text-faint">-</span>
                    )}
                  </td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      <FileButton accept={ACCEPT} onChange={(next) => onChange(doc.key, next)}>
                        {(props) => (
                          <button
                            type="button"
                            className={`btn ${file ? "btn-ghost" : "btn-secondary"} btn-sm`}
                            {...props}
                          >
                            {file ? "Ganti" : "Pilih File"}
                          </button>
                        )}
                      </FileButton>
                      {file && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => onChange(doc.key, null)}
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <span className="caption text-muted">
        PDF atau JPG, maksimal {formatFileSize(MAX_DOCUMENT_SIZE)} per berkas. Unggah hasil pindai
        asli, bukan tautan Drive. Unggahan Surat Kontrak membangkitkan No Kontrak otomatis.
      </span>
    </div>
  )
}
