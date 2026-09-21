"use client"

import { Modal, Select, TextInput } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import { useState } from "react"

import { Notice } from "@/src/components/ui/Notice"
import { formatDate } from "@/src/lib/format"

import { type Alumnus, type PlacementData, VISA_TYPES, type VisaData } from "../sample"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

export type EditSection = "visa" | "placement"

const proposalLabel = (value: string | null | undefined) =>
  value === null || value === undefined || value === ""
    ? null
    : /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? formatDate(value)
      : value

export function AlumniEditModal({
  alumnus,
  section,
  onClose,
  onSave,
}: {
  alumnus: Alumnus
  section: EditSection | null
  onClose: () => void
  onSave: (section: EditSection, visa: VisaData, placement: PlacementData) => void
}) {
  const [visa, setVisa] = useState<VisaData>(alumnus.visa)
  const [placement, setPlacement] = useState<PlacementData>(alumnus.placement)
  const proposal = alumnus.proposal ?? {}

  const hint = (key: keyof VisaData | keyof PlacementData) => {
    const value = proposalLabel(proposal[key as keyof typeof proposal])
    return value ? `Usulan siswa: ${value}` : undefined
  }

  const willBecomeAlumni =
    section === "placement" && !alumnus.placement.departureAt && placement.departureAt

  return (
    <Modal
      opened={section !== null}
      onClose={onClose}
      title={section === "visa" ? "Ubah Proses Visa" : "Ubah Data Penempatan"}
      size="lg"
      styles={TITLE_STYLE}
    >
      {section && (
        <form
          className="stack stack-lg"
          onSubmit={(event) => {
            event.preventDefault()
            onSave(section, visa, placement)
            onClose()
          }}
        >
          <Notice tone="info">
            Yang tersimpan di sini adalah versi yang berlaku dan tercetak. Isian siswa dari portal
            hanya usulan; kalau ada, ia ditulis di bawah kolom sebagai pembanding.
          </Notice>

          <DatesProvider settings={{ locale: "id" }}>
            {section === "visa" ? (
              <>
                <div className="grid-2">
                  <DateInput
                    label="Tanggal Pengajuan Visa"
                    description={hint("appliedAt")}
                    valueFormat="DD MMM YYYY"
                    value={visa.appliedAt}
                    onChange={(value) => setVisa({ ...visa, appliedAt: value })}
                    clearable
                  />
                  <DateInput
                    label="Tanggal Wawancara Kedutaan"
                    description={hint("interviewAt")}
                    valueFormat="DD MMM YYYY"
                    value={visa.interviewAt}
                    onChange={(value) => setVisa({ ...visa, interviewAt: value })}
                    clearable
                  />
                </div>
                <div className="grid-2">
                  <DateInput
                    label="Tanggal Visa Terbit"
                    description={hint("issuedAt")}
                    valueFormat="DD MMM YYYY"
                    value={visa.issuedAt}
                    onChange={(value) => setVisa({ ...visa, issuedAt: value })}
                    clearable
                  />
                  <TextInput
                    label="Masa Berlaku Visa"
                    placeholder="1 Tahun"
                    value={visa.validity ?? ""}
                    onChange={(event) =>
                      setVisa({ ...visa, validity: event.currentTarget.value || null })
                    }
                  />
                </div>
                <Select
                  label="Jenis Visa"
                  placeholder="Pilih jenis visa"
                  data={[...VISA_TYPES]}
                  value={visa.type}
                  onChange={(value) => setVisa({ ...visa, type: value as VisaData["type"] })}
                />
              </>
            ) : (
              <>
                <div className="grid-2">
                  <TextInput
                    label="Perusahaan / Betrieb"
                    description={hint("company")}
                    value={placement.company}
                    onChange={(event) =>
                      setPlacement({ ...placement, company: event.currentTarget.value })
                    }
                    required
                  />
                  <TextInput
                    label="Sekolah (Berufsschule)"
                    description={hint("school")}
                    value={placement.school}
                    onChange={(event) =>
                      setPlacement({ ...placement, school: event.currentTarget.value })
                    }
                  />
                </div>
                <div className="grid-2">
                  <TextInput
                    label="Jurusan Ausbildung"
                    description={hint("major")}
                    value={placement.major}
                    onChange={(event) =>
                      setPlacement({ ...placement, major: event.currentTarget.value })
                    }
                  />
                  <TextInput
                    label="Kota / Bundesland"
                    description={hint("cityState")}
                    value={placement.cityState}
                    onChange={(event) =>
                      setPlacement({ ...placement, cityState: event.currentTarget.value })
                    }
                  />
                </div>
                <div className="grid-2">
                  <DateInput
                    label="Tanggal Mulai Kontrak"
                    description={hint("contractStart")}
                    valueFormat="DD MMM YYYY"
                    value={placement.contractStart}
                    onChange={(value) => setPlacement({ ...placement, contractStart: value })}
                    clearable
                  />
                  <DateInput
                    label="Tanggal Selesai Kontrak"
                    description={hint("contractEnd")}
                    valueFormat="DD MMM YYYY"
                    value={placement.contractEnd}
                    onChange={(value) => setPlacement({ ...placement, contractEnd: value })}
                    clearable
                  />
                </div>
                <DateInput
                  label="Tanggal Keberangkatan"
                  description={
                    hint("departureAt") ??
                    "Mengisi tanggal ini menyalakan status Alumni secara otomatis."
                  }
                  valueFormat="DD MMM YYYY"
                  value={placement.departureAt}
                  onChange={(value) => setPlacement({ ...placement, departureAt: value })}
                  clearable
                />
                {willBecomeAlumni && (
                  <Notice tone="warning">
                    Menyimpan tanggal keberangkatan mengubah status {alumnus.name} menjadi Alumni di
                    seluruh sistem, termasuk halaman Siswa dan portal.
                  </Notice>
                )}
              </>
            )}
          </DatesProvider>

          <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
