"use client"

import { Modal } from "@mantine/core"
import { useState } from "react"

import { PasswordChangeForm } from "@/src/components/auth/PasswordChangeForm"

export function ChangePasswordModal() {
  const [opened, setOpened] = useState(false)
  const close = () => setOpened(false)

  return (
    <>
      <button type="button" className="btn btn-secondary" onClick={() => setOpened(true)}>
        Ubah Kata Sandi
      </button>

      <Modal
        opened={opened}
        onClose={close}
        title="Ubah Kata Sandi"
        styles={{ title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }}
      >
        {opened && <PasswordChangeForm kind="student" onCancel={close} />}
      </Modal>
    </>
  )
}
