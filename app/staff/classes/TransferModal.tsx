"use client"

import { Checkbox, Group, Modal, Select, Textarea } from "@mantine/core"
import { useState } from "react"

import { Notice } from "@/src/components/ui/Notice"
import { notify } from "@/src/lib/notify"

import {
  capacityLabel,
  classLabel,
  CLASSES,
  type ClassMember,
  type ClassRoom,
  seatsLeft,
} from "./sample"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

const movable = (member: ClassMember) => member.status !== "Keluar"

export function TransferModal({
  opened,
  onClose,
  room,
  members,
  student,
}: {
  opened: boolean
  onClose: () => void
  room: ClassRoom
  members: readonly ClassMember[]
  student?: ClassMember
}) {
  const [selected, setSelected] = useState<string[]>(student ? [student.nis] : [])
  const [targetId, setTargetId] = useState<string | null>(null)
  const [isOverloadAccepted, setIsOverloadAccepted] = useState(false)

  const targets = CLASSES.filter(
    (candidate) => candidate.id !== room.id && candidate.status === "Aktif",
  )
  const target = targets.find((candidate) => candidate.id === targetId)
  const overflow = target ? selected.length - seatsLeft(target) : 0
  const isOverCapacity = overflow > 0
  const canSubmit =
    selected.length > 0 && target !== undefined && (!isOverCapacity || isOverloadAccepted)

  const blockedReason = !target
    ? "Pilih dulu kelas tujuan"
    : selected.length === 0
      ? "Pilih dulu siswa yang akan dipindahkan"
      : isOverCapacity && !isOverloadAccepted
        ? "Centang persetujuan melebihi kapasitas dulu"
        : undefined

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={student ? `Pindahkan ${student.name}` : "Pindahkan Siswa Massal"}
      size="lg"
      styles={TITLE_STYLE}
    >
      <form
        className="stack stack-lg"
        onSubmit={(event) => {
          event.preventDefault()
          notify.success(
            `${selected.length} siswa dipindahkan dari ${room.name} ke ${target?.name}.`,
          )
          onClose()
        }}
        onReset={onClose}
      >
        {student ? (
          <dl className="row row-wrap" style={{ gap: 24, margin: 0 }}>
            {[
              { label: "NIS", value: student.nis },
              { label: "Kelas asal", value: classLabel(room) },
              { label: "Bab terakhir", value: student.lastChapter },
            ].map(({ label, value }) => (
              <div key={label} className="stack" style={{ gap: 2 }}>
                <dt className="caption text-muted">{label}</dt>
                <dd className="body-sm" style={{ fontWeight: 600, margin: 0 }}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <Checkbox.Group
            label={`Siswa ${room.name}`}
            description="Siswa berstatus Keluar tidak bisa dipindahkan."
            value={selected}
            onChange={setSelected}
          >
            <div className="stack" style={{ gap: 12, marginBlockStart: 12 }}>
              {members.map((member) => (
                <Checkbox
                  key={member.nis}
                  value={member.nis}
                  label={member.name}
                  description={`NIS ${member.nis} · ${member.lastChapter} · ${member.status}`}
                  disabled={!movable(member)}
                />
              ))}
            </div>
          </Checkbox.Group>
        )}

        <Select
          label="Kelas tujuan"
          placeholder="Pilih kelas aktif"
          data={targets.map((candidate) => ({
            value: candidate.id,
            label: `${classLabel(candidate)} - ${capacityLabel(candidate)}`,
          }))}
          value={targetId}
          onChange={setTargetId}
          comboboxProps={{ position: "bottom-start" }}
          required
        />

        <Textarea
          name="note"
          label="Alasan pemindahan"
          description="Tercatat di log aktivitas kelas asal dan kelas tujuan."
          placeholder="Contoh: naik level setelah lulus ujian A2."
          autosize
          minRows={2}
        />

        {isOverCapacity && target && (
          <Notice tone="warning" title="Melebihi kapasitas kelas tujuan">
            <div className="stack" style={{ gap: 8 }}>
              <span>
                {target.name} tinggal {Math.max(seatsLeft(target), 0)} kursi, sedang yang
                dipindahkan {selected.length} siswa. Kelebihan {overflow} siswa butuh persetujuan
                Anda.
              </span>
              <Checkbox
                label="Saya tetap memindahkan siswa melebihi kapasitas."
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
            title={blockedReason}
          >
            Pindahkan {selected.length > 0 ? `${selected.length} Siswa` : "Siswa"}
          </button>
        </Group>
      </form>
    </Modal>
  )
}
