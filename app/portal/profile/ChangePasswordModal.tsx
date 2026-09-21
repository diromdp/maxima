"use client"

import { useState } from "react"
import { Group, Modal, PasswordInput, Stack, Text } from "@mantine/core"
import { notify } from "@/src/lib/notify"

const MIN_LENGTH = 8

export function ChangePasswordModal() {
  const [opened, setOpened] = useState(false)
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")

  const confirmError =
    confirm && confirm !== next ? "Ulangi kata sandi baru dengan sama persis." : null
  const canSubmit = current.length > 0 && next.length >= MIN_LENGTH && confirm === next

  function close() {
    setOpened(false)
    setCurrent("")
    setNext("")
    setConfirm("")
  }

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
        <form
          onSubmit={(event) => {
            event.preventDefault()
            notify.success("Kata sandi diperbarui. Gunakan yang baru saat masuk berikutnya.")
            close()
          }}
        >
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Satu-satunya data yang bisa Anda ubah sendiri. Minimal {MIN_LENGTH} karakter.
            </Text>
            <PasswordInput
              label="Kata sandi saat ini"
              placeholder="Masukkan kata sandi saat ini"
              autoComplete="current-password"
              value={current}
              onChange={(event) => setCurrent(event.currentTarget.value)}
            />
            <PasswordInput
              label="Kata sandi baru"
              placeholder={`Minimal ${MIN_LENGTH} karakter`}
              description={`Minimal ${MIN_LENGTH} karakter.`}
              autoComplete="new-password"
              value={next}
              onChange={(event) => setNext(event.currentTarget.value)}
            />
            <PasswordInput
              label="Ulangi kata sandi baru"
              placeholder="Ketik ulang kata sandi baru"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.currentTarget.value)}
              error={confirmError}
            />
            <Group justify="flex-end">
              <button type="button" className="btn btn-secondary" onClick={close}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
                Simpan Kata Sandi
              </button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  )
}
