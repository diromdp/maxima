"use client"

import { Group, Modal } from "@mantine/core"

import { Notice } from "@/src/components/ui/Notice"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

export function FormModal({
  title,
  size,
  submitLabel = "Simpan",
  formError,
  isPending,
  onSubmit,
  onClose,
  children,
}: {
  title: string
  size?: "md" | "lg"
  submitLabel?: string
  formError: string | null
  isPending: boolean
  onSubmit: (event?: React.FormEvent<HTMLFormElement>) => void
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <Modal opened onClose={onClose} title={title} size={size} styles={TITLE_STYLE}>
      <form className="stack stack-lg" onSubmit={onSubmit} noValidate>
        {formError && <Notice tone="danger">{formError}</Notice>}
        {children}
        <Group justify="flex-end">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? "Menyimpan..." : submitLabel}
          </button>
        </Group>
      </form>
    </Modal>
  )
}
