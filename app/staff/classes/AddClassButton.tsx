"use client"

import { useDisclosure } from "@mantine/hooks"

import { ClassFormModal } from "./ClassFormModal"

export function AddClassButton() {
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={open}>
        + Tambah Kelas
      </button>

      <ClassFormModal key={`add-${opened}`} opened={opened} onClose={close} />
    </>
  )
}
