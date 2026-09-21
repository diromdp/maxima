import { Box, Center, Group, Stack } from "@mantine/core"

import { Logo } from "@/src/components/brand/Logo"

export function ErrorScreen({
  code,
  title,
  description,
  actions,
}: {
  code: string
  title: string
  description: string
  actions: React.ReactNode
}) {
  return (
    <Box className="grid-2 gap-0" mih="100dvh" bg="var(--canvas)">
      <Center p="xl">
        <Stack gap="xl" w="100%" maw={420}>
          <Logo height={56} />

          <Stack gap="sm">
            <span className="label text-faint">Galat {code}</span>
            <h1 className="h2">{title}</h1>
            <p className="text-muted" style={{ maxWidth: "46ch" }}>
              {description}
            </p>
          </Stack>

          <Group gap="sm">{actions}</Group>
        </Stack>
      </Center>

      <Box
        className="hide-mobile grid content-end"
        p="xl"
        my="md"
        me="md"
        style={{
          borderRadius: 24,
          overflow: "hidden",
          backgroundImage:
            "linear-gradient(to top, rgba(16, 16, 16, 0.85) 0%, rgba(16, 16, 16, 0.25) 50%, rgba(16, 16, 16, 0.1) 100%), url(/images/backgrond-login.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Stack gap={6} maw={440}>
          <span className="h4 text-on-primary">Perjalanan Anda tidak berhenti di sini.</span>
          <span className="caption" style={{ color: "rgba(255, 255, 255, 0.72)" }}>
            Kursus bahasa, pemberkasan, sampai keberangkatan tetap berjalan seperti biasa.
          </span>
        </Stack>
      </Box>
    </Box>
  )
}
