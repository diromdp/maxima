"use client"

import { Checkbox, Group, Modal, Skeleton } from "@mantine/core"
import { useForm } from "@mantine/form"

import { QueryError } from "@/src/components/data/QueryError"
import { Notice } from "@/src/components/ui/Notice"
import { addClassMembers } from "@/src/entities/class/actions"
import { classCandidatesQuery } from "@/src/entities/class/queries"
import type { Candidates, ClassRow } from "@/src/entities/class/schema"
import { useRead } from "@/src/lib/api/use-read"
import { useActionForm } from "@/src/lib/use-action-form"

import { CapacityWarning, Facts, MEMBER_INVALIDATIONS, TITLE_STYLE } from "./DialogParts"

const CANDIDATE_SKELETONS = 4

type AddForm = { studentIds: string[]; isOverCapacityConfirmed: boolean }

export function AddMembersModal({ room, onClose }: { room: ClassRow; onClose: () => void }) {
  const candidates = useRead(classCandidatesQuery(room.id))

  return (
    <Modal
      opened
      onClose={onClose}
      title={`Tambah Siswa ke ${room.name}`}
      size="lg"
      styles={TITLE_STYLE}
    >
      {candidates.isError ? (
        <QueryError message={candidates.error.message} onRetry={() => void candidates.refetch()} />
      ) : candidates.isPending ? (
        <div className="stack" aria-busy="true">
          <span className="sr-only" role="status">
            Memuat
          </span>
          {Array.from({ length: CANDIDATE_SKELETONS }, (_, index) => (
            <Skeleton key={index} height={44} radius="sm" aria-hidden />
          ))}
        </div>
      ) : (
        <AddMembersForm room={room} candidates={candidates.data} onClose={onClose} />
      )}
    </Modal>
  )
}

function AddMembersForm({
  room,
  candidates,
  onClose,
}: {
  room: ClassRow
  candidates: Candidates
  onClose: () => void
}) {
  const form = useForm<AddForm>({
    initialValues: { studentIds: [], isOverCapacityConfirmed: false },
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => addClassMembers(room.id, values.studentIds, values.isOverCapacityConfirmed),
    successMessage: `${form.values.studentIds.length} siswa ditambahkan ke ${room.name}.`,
    invalidates: MEMBER_INVALIDATIONS,
    onSuccess: onClose,
  })

  const chosen = form.values.studentIds.length
  const isOverCapacity = chosen > candidates.remainingSeats
  const blockedReason =
    chosen === 0
      ? "Pilih dulu siswa yang akan ditambahkan"
      : isOverCapacity && !form.values.isOverCapacityConfirmed
        ? "Centang persetujuan melebihi kapasitas dulu"
        : undefined

  return (
    <form className="stack stack-lg" onSubmit={submit} noValidate>
      {formError && <Notice tone="danger">{formError}</Notice>}

      <Facts
        items={[
          { label: "Kapasitas", value: `${candidates.memberCount}/${candidates.capacity} Siswa` },
          { label: "Sisa kursi", value: `${candidates.remainingSeats} Kursi` },
          { label: "Level", value: `Deutsch ${candidates.level.name}` },
        ]}
      />

      {candidates.data.length === 0 ? (
        <p className="body-sm text-muted">Tidak ada siswa aktif yang belum masuk kelas mana pun.</p>
      ) : (
        <Checkbox.Group
          label="Siswa tanpa kelas"
          description="Hanya siswa berstatus Aktif yang belum masuk kelas mana pun."
          {...form.getInputProps("studentIds")}
        >
          <div className="stack" style={{ gap: 12, marginBlockStart: 12 }}>
            {candidates.data.map((student) => (
              <Checkbox
                key={student.studentId}
                value={student.studentId}
                disabled={student.currentClassName !== null}
                label={
                  <span className="row row-wrap" style={{ gap: 8 }}>
                    {student.fullName}
                    {student.isAwaitingNewLevel && (
                      <span className="badge badge-berjalan">Menunggu kelas level baru</span>
                    )}
                  </span>
                }
                description={
                  <>
                    {[
                      `NIS ${student.nis ?? "-"}`,
                      student.levelName && `Level ${student.levelName}`,
                      student.branchName,
                      student.currentClassName && `Masih di ${student.currentClassName}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    {student.currentClassName && (
                      <span className="block">
                        Pindahkan dari kelas asalnya lewat tombol Pindahkan.
                      </span>
                    )}
                  </>
                }
              />
            ))}
          </div>
        </Checkbox.Group>
      )}

      {isOverCapacity && (
        <CapacityWarning
          className={room.name}
          seats={candidates.remainingSeats}
          chosen={chosen}
          checked={form.values.isOverCapacityConfirmed}
          onChange={(checked) => form.setFieldValue("isOverCapacityConfirmed", checked)}
          consent="Saya tetap menambahkan siswa melebihi kapasitas."
        />
      )}

      <Group justify="flex-end">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Batal
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={blockedReason !== undefined || isPending}
          title={blockedReason}
        >
          {isPending ? "Menyimpan..." : `Tambahkan ${chosen > 0 ? `${chosen} Siswa` : "Siswa"}`}
        </button>
      </Group>
    </form>
  )
}
