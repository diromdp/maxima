"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { ImportModal } from "@/src/components/ui/ImportModal"
import { importStudents } from "@/src/entities/student/actions"

const STEPS = [
  "Unduh templat, lalu salin data lama ke dalamnya. Satu baris satu siswa.",
  <>
    Kolom wajib berjudul biru: <code>full_name</code>, <code>branch_code</code>, dan{" "}
    <code>status</code>. Tanggal ditulis <code>YYYY-MM-DD</code>.
  </>,
  "Simpan sebagai Excel (.xlsx), unggah, periksa hasilnya, lalu impor.",
]

export function ImportStudentsButton() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(true)}>
        Impor Data (.xlsx)
      </button>
      {isOpen && (
        <ImportModal
          title="Impor Data Siswa"
          templateUrl="/api/download/registrations/import/students/template"
          steps={STEPS}
          noun="siswa"
          run={importStudents}
          onImported={() => queryClient.invalidateQueries({ queryKey: ["students"] })}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
