"use client"

import { Menu } from "@mantine/core"
import { useQueryClient } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { useState } from "react"

import { ImportModal } from "@/src/components/ui/ImportModal"
import { importClassData } from "@/src/entities/class/actions"

type Resource = "classes" | "class-members"

const IMPORTS: Record<
  Resource,
  { menuLabel: string; title: string; noun: string; steps: readonly ReactNode[] }
> = {
  classes: {
    menuLabel: "Data Kelas",
    title: "Impor Data Kelas",
    noun: "kelas",
    steps: [
      "Unduh templat, lalu salin data kelas lama ke dalamnya. Satu baris satu kelas.",
      <>
        Kolom wajib berjudul biru. Hari belajar dipisah titik koma (<code>Sen;Rab</code>), jam{" "}
        <code>08:00</code>, dan tanggal <code>YYYY-MM-DD</code>. Pengajar ditulis dengan alamat
        surelnya.
      </>,
      "Simpan sebagai Excel (.xlsx), unggah, periksa hasilnya, lalu impor.",
    ],
  },
  "class-members": {
    menuLabel: "Anggota Kelas",
    title: "Impor Anggota Kelas",
    noun: "anggota kelas",
    steps: [
      "Impor data kelasnya lebih dulu. Satu baris satu siswa di satu kelas.",
      <>
        Kolom wajib berjudul biru: <code>class_name</code> persis seperti di Master Kelas,{" "}
        <code>branch_code</code>, dan NIS lama siswa di <code>legacy_nis</code>. Status boleh
        kosong, artinya Aktif.
      </>,
      "Simpan sebagai Excel (.xlsx), unggah, periksa hasilnya, lalu impor.",
    ],
  },
}

const REFRESHED_KEYS = [
  ["classes"],
  ["class-members"],
  ["class-candidates"],
  ["class-calendar"],
  ["kkm-standards"],
]

export function ImportClassesButton() {
  const queryClient = useQueryClient()
  const [resource, setResource] = useState<Resource | null>(null)

  return (
    <>
      <Menu position="bottom-end" shadow="md" offset={8}>
        <Menu.Target>
          <button type="button" className="btn btn-secondary">
            Impor Data (.xlsx)
          </button>
        </Menu.Target>
        <Menu.Dropdown>
          {(Object.keys(IMPORTS) as Resource[]).map((key) => (
            <Menu.Item key={key} onClick={() => setResource(key)}>
              {IMPORTS[key].menuLabel}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>

      {resource && (
        <ImportModal
          key={resource}
          title={IMPORTS[resource].title}
          templateUrl={`/api/download/classes/import/${resource}/template`}
          steps={IMPORTS[resource].steps}
          noun={IMPORTS[resource].noun}
          run={(xlsx, step) => importClassData(resource, xlsx, step)}
          onImported={() =>
            Promise.all(
              REFRESHED_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
            )
          }
          onClose={() => setResource(null)}
        />
      )}
    </>
  )
}
