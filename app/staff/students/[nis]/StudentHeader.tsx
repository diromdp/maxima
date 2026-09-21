"use client"

import { Avatar, FileInput, Group, Modal, Select, Textarea, TextInput } from "@mantine/core"
import { notify } from "@/src/lib/notify"
import { useState } from "react"

import { STATUS_BADGE, STATUS_ORDER, type Student, type StudentStatus } from "../sample"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

const TODAY = new Date().toISOString().slice(0, 10)

/**
 * Kepala detail siswa. Memegang status supaya badge dan dialog Ubah Status
 * (PRD 2.3: status baru, tanggal berlaku, alasan, berkas pendukung) satu
 * keadaan. Alumni tidak bisa dipilih - menyala otomatis saat tanggal
 * keberangkatan terisi di Visa & Penempatan. Perubahan hanya hidup di layar
 * ini (fase slicing).
 */
export function StudentHeader({
  student,
  phase,
  enrolled,
}: {
  student: Student
  phase: string
  enrolled: string
}) {
  const [status, setStatus] = useState<StudentStatus>(student.status)
  const [opened, setOpened] = useState(false)
  const [next, setNext] = useState<string | null>(null)
  const { name } = student

  const badge = <span className={`badge ${STATUS_BADGE[status]}`}>{status}</span>

  return (
    <section className="card row row-between row-wrap" style={{ gap: 16 }}>
      <div className="row" style={{ gap: 16, minWidth: 0 }}>
        <Avatar radius="md" size={64} color="dark" variant="light">
          {name.charAt(0)}
        </Avatar>
        <div className="stack" style={{ gap: 6, minWidth: 0 }}>
          <h1 className="h4">{name}</h1>
          <span className="caption text-muted tabular">
            NIS {student.nis} · Kontrak {student.contractNumber}
          </span>
          <div className="row row-wrap" style={{ gap: 6 }}>
            {badge}
            <span className="badge">{phase}</span>
            <span className="badge">{student.packageName}</span>
          </div>
        </div>
      </div>

      <div className="row row-wrap" style={{ gap: 24 }}>
        <Meta label="Cabang" value={student.branch} />
        <Meta label="PIC Konsultan" value={student.pic} />
        <Meta label="Masuk" value={enrolled} tabular />
        <button type="button" className="btn btn-secondary" onClick={() => setOpened(true)}>
          Ubah Status
        </button>
      </div>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={`Ubah Status ${name}`}
        styles={TITLE_STYLE}
      >
        <form
          className="stack stack-lg"
          onSubmit={(e) => {
            e.preventDefault()
            if (next) setStatus(next as StudentStatus)
            notify.success(
              `Status ${name} diubah menjadi ${next}. Tercatat di Log Aktivitas dan tab Riwayat.`,
            )
            setNext(null)
            setOpened(false)
          }}
          onReset={() => setOpened(false)}
        >
          <div className="row" style={{ gap: 8 }}>
            <span className="caption text-muted">Status saat ini</span>
            {badge}
          </div>
          <Select
            name="status"
            label="Status baru"
            placeholder="Pilih status"
            data={STATUS_ORDER.map((s) => ({
              value: s,
              label: s,
              disabled: s === status || s === "Alumni",
            }))}
            description="Alumni menyala otomatis saat tanggal keberangkatan terisi di Visa & Penempatan."
            value={next}
            onChange={setNext}
            required
          />
          <TextInput
            name="effectiveDate"
            type="date"
            label="Tanggal berlaku"
            defaultValue={TODAY}
            required
          />
          <Textarea
            name="reason"
            label="Alasan"
            placeholder="Contoh: mengundurkan diri karena alasan keluarga"
            autosize
            minRows={2}
            required
          />
          <FileInput
            name="attachment"
            label="Berkas pendukung"
            placeholder="Surat pernyataan, PDF atau JPG"
            accept="application/pdf,image/jpeg"
            clearable
          />
          <Group justify="flex-end">
            <button type="reset" className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={!next}>
              Simpan Status
            </button>
          </Group>
        </form>
      </Modal>
    </section>
  )
}

function Meta({ label, value, tabular }: { label: string; value: string; tabular?: boolean }) {
  return (
    <div className="stack" style={{ gap: 2 }}>
      <span className="caption text-muted">{label}</span>
      <span className={`body-sm${tabular ? " tabular" : ""}`} style={{ fontWeight: 600 }}>
        {value}
      </span>
    </div>
  )
}
