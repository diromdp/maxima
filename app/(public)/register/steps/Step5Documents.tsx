import { Upload04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Anchor, Badge, Box, Button, FileButton, Group, Stack, Text } from "@mantine/core"

import { Notice } from "@/src/components/ui/Notice"
import { UPLOAD_ACCEPT } from "@/src/lib/upload"

export type DocumentSlot = {
  code: string
  name: string
  required: boolean
  fileName: string | null
  isUploaded: boolean
  error: string | null
}

const statusOf = (slot: DocumentSlot, isBusy: boolean) =>
  isBusy
    ? { label: "Mengunggah", tone: "badge-berjalan" }
    : slot.isUploaded
      ? { label: "Terunggah", tone: "badge-beres" }
      : { label: "Belum", tone: "badge-tindakan" }

export function Step5Documents({
  slots,
  busyCode = null,
  onSelect,
}: {
  slots: readonly DocumentSlot[]
  busyCode?: string | null
  onSelect: (code: string, file: File | null) => void
}) {
  const required = slots.filter((slot) => slot.required)
  const uploadedRequired = required.filter((slot) => slot.isUploaded).length
  const allRequiredDone = uploadedRequired === required.length

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          Format PDF, JPG, atau PNG, maksimal 5 MB per berkas. Unggah berkas asli, bukan tautan
          Google Drive.
        </Text>
        <Anchor href="#" size="sm" onClick={(e) => e.preventDefault()}>
          <Group gap={4} wrap="nowrap">
            <HugeiconsIcon icon={Upload04Icon} size={16} strokeWidth={1.5} />
            Panduan Upload
          </Group>
        </Anchor>
      </Group>

      <Stack gap="xs">
        {slots.map((slot) => {
          const isBusy = busyCode === slot.code
          const status = statusOf(slot, isBusy)
          return (
            <Box
              key={slot.code}
              className="row-soft"
              p="md"
              style={{ flexDirection: "column", alignItems: "stretch", gap: 4 }}
            >
              <Group justify="space-between" align="center" wrap="nowrap" w="100%">
                <Stack gap={2} style={{ flex: 1 }}>
                  <Text fw={500}>
                    {slot.name}
                    {!slot.required && (
                      <Text component="span" size="xs" c="dimmed">
                        {" "}
                        (opsional)
                      </Text>
                    )}
                  </Text>
                  {slot.fileName && (
                    <Text size="xs" c="dimmed">
                      {slot.fileName}
                    </Text>
                  )}
                </Stack>

                <Group justify="flex-end" w={112} ml="auto">
                  <Badge className={`badge ${status.tone}`}>{status.label}</Badge>
                </Group>

                <FileButton
                  onChange={(file) => onSelect(slot.code, file)}
                  accept={UPLOAD_ACCEPT}
                  disabled={busyCode !== null}
                >
                  {(props) => (
                    <Button
                      {...props}
                      variant={slot.isUploaded ? "outline" : "filled"}
                      size="sm"
                      w={96}
                      loading={isBusy}
                    >
                      {slot.isUploaded ? "Ganti" : "Unggah"}
                    </Button>
                  )}
                </FileButton>
              </Group>
              {slot.error && (
                <Text size="xs" c="tindakan">
                  {slot.error}
                </Text>
              )}
            </Box>
          )
        })}
      </Stack>

      <Notice tone={allRequiredDone ? "success" : "danger"}>
        {allRequiredDone
          ? `${required.length} dari ${required.length} dokumen wajib sudah lengkap.`
          : `${uploadedRequired} dari ${required.length} dokumen wajib sudah diunggah, ${required.length - uploadedRequired} lagi.`}
      </Notice>
    </Stack>
  )
}
