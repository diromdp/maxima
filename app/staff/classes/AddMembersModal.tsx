"use client"

import { Checkbox, Group, Modal } from "@mantine/core"
import { useState } from "react"

import { Notice } from "@/src/components/ui/Notice"
import { notify } from "@/src/lib/notify"

import { CANDIDATE_STUDENTS, capacityLabel, type ClassRoom, seatsLeft } from "./sample"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

export function AddMembersModal({
  opened,
  onClose,
  room,
}: {
  opened: boolean
  onClose: () => void
  room: ClassRoom
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [isOverloadAccepted, setIsOverloadAccepted] = useState(false)

  const overflow = selected.length - seatsLeft(room)
  const isOverCapacity = overflow > 0
  const canSubmit = selected.length > 0 && (!isOverCapacity || isOverloadAccepted)

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Tambah Siswa ke ${room.name}`}
      size="lg"
      styles={TITLE_STYLE}
    >
      <form
        className="stack stack-lg"
        onSubmit={(event) => {
          event.preventDefault()
          notify.success(`${selected.length} siswa ditambahkan ke ${room.name}.`)
          onClose()
        }}
        onReset={onClose}
      >
        <dl className="row row-wrap" style={{ gap: 24, margin: 0 }}>
          {[
            { label: "Kapasitas", value: `${capacityLabel(room)} Siswa` },
            { label: "Sisa kursi", value: `${Math.max(seatsLeft(room), 0)} Kursi` },
            { label: "Level", value: `Deutsch ${room.level}` },
          ].map(({ label, value }) => (
            <div key={label} className="stack" style={{ gap: 2 }}>
              <dt className="caption text-muted">{label}</dt>
              <dd className="body-sm" style={{ fontWeight: 600, margin: 0 }}>
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <Checkbox.Group
          label="Siswa tanpa kelas"
          description="Hanya siswa berstatus Aktif yang belum masuk kelas mana pun."
          value={selected}
          onChange={setSelected}
        >
          <div className="stack" style={{ gap: 12, marginBlockStart: 12 }}>
            {CANDIDATE_STUDENTS.map((student) => (
              <Checkbox
                key={student.nis}
                value={student.nis}
                label={student.name}
                description={`NIS ${student.nis} · Level ${student.level} · ${student.branch}`}
              />
            ))}
          </div>
        </Checkbox.Group>

        {isOverCapacity && (
          <Notice tone="warning" title="Melebihi kapasitas kelas">
            <div className="stack" style={{ gap: 8 }}>
              <span>
                {room.name} tinggal {Math.max(seatsLeft(room), 0)} kursi, sedang yang dipilih{" "}
                {selected.length} siswa. Kelebihan {overflow} siswa butuh persetujuan Anda.
              </span>
              <Checkbox
                label="Saya tetap menambahkan siswa melebihi kapasitas."
                checked={isOverloadAccepted}
                onChange={(event) => setIsOverloadAccepted(event.currentTarget.checked)}
              />
            </div>
          </Notice>
        )}

        <Group justify="flex-end">
          <button type="reset" className="btn btn-secondary">
            Batal
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!canSubmit}
            title={
              selected.length === 0
                ? "Pilih dulu siswa yang akan ditambahkan"
                : isOverCapacity && !isOverloadAccepted
                  ? "Centang persetujuan melebihi kapasitas dulu"
                  : undefined
            }
          >
            Tambahkan {selected.length > 0 ? `${selected.length} Siswa` : "Siswa"}
          </button>
        </Group>
      </form>
    </Modal>
  )
}
