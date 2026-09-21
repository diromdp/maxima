import { Upload04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Anchor, Badge, Box, Button, FileButton, Group, Stack, Text } from "@mantine/core"

import { formatFileSize } from "@/src/lib/format"
import { Notice } from "@/src/components/ui/Notice"

import {
  ACCEPTED_DOCUMENT_TYPES,
  DOCUMENTS,
  MAX_DOCUMENT_SIZE,
  REQUIRED_DOCUMENT_COUNT,
  type DocumentKey,
} from "../data"

type Documents = Record<DocumentKey, File | null>

export function Step5Documents({
  documents,
  onChange,
}: {
  documents: Documents
  onChange: (key: DocumentKey, file: File | null) => void
}) {
  const uploadedRequired = DOCUMENTS.filter((d) => d.required && documents[d.key]).length
  const allRequiredDone = uploadedRequired === REQUIRED_DOCUMENT_COUNT

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          Tiap dokumen wajib. Format PDF atau JPG, maksimal 5 MB per berkas. Unggah berkas asli,
          bukan tautan Google Drive.
        </Text>
        <Anchor href="#" size="sm" onClick={(e) => e.preventDefault()}>
          <Group gap={4} wrap="nowrap">
            <HugeiconsIcon icon={Upload04Icon} size={16} strokeWidth={1.5} />
            Panduan Upload
          </Group>
        </Anchor>
      </Group>

      <Stack gap="xs">
        {DOCUMENTS.map((doc) => {
          const file = documents[doc.key]
          const invalid =
            file !== null &&
            (!ACCEPTED_DOCUMENT_TYPES.includes(file.type) || file.size > MAX_DOCUMENT_SIZE)

          return (
            <Box
              key={doc.key}
              className="row-soft"
              p="md"
              style={{ flexDirection: "column", alignItems: "stretch", gap: 4 }}
            >
              <Group justify="space-between" align="center" wrap="nowrap" w="100%">
                <Stack gap={2} style={{ flex: 1 }}>
                  <Text fw={500}>
                    {doc.label}
                    {!doc.required && (
                      <Text component="span" size="xs" c="dimmed">
                        {" "}
                        (opsional)
                      </Text>
                    )}
                  </Text>
                  {file && (
                    <Text size="xs" c="dimmed">
                      {file.name} · {formatFileSize(file.size)}
                    </Text>
                  )}
                </Stack>

                <Group justify="flex-end" w={96} ml="auto">
                  <Badge className={`badge ${file && !invalid ? "badge-beres" : "badge-tindakan"}`}>
                    {file && !invalid ? "Terunggah" : "Belum"}
                  </Badge>
                </Group>

                <FileButton
                  onChange={(f) => onChange(doc.key, f)}
                  accept={ACCEPTED_DOCUMENT_TYPES.join(",")}
                >
                  {(props) => (
                    <Button {...props} variant={file ? "outline" : "filled"} size="sm" w={96}>
                      {file ? "Ganti" : "Unggah"}
                    </Button>
                  )}
                </FileButton>
              </Group>
              {invalid && (
                <Text size="xs" c="tindakan">
                  Berkas melebihi 5 MB atau bukan PDF/JPG — unggah ulang.
                </Text>
              )}
            </Box>
          )
        })}
      </Stack>

      <Notice tone="info">Format PDF atau JPG, maksimal 5 MB per berkas.</Notice>

      <Notice tone={allRequiredDone ? "success" : "danger"}>
        {allRequiredDone
          ? `${REQUIRED_DOCUMENT_COUNT} dari ${REQUIRED_DOCUMENT_COUNT} dokumen wajib sudah lengkap.`
          : `${uploadedRequired} dari ${REQUIRED_DOCUMENT_COUNT} dokumen wajib sudah diunggah, ${REQUIRED_DOCUMENT_COUNT - uploadedRequired} lagi.`}
      </Notice>
    </Stack>
  )
}
