import { Anchor, Box, Center, Stack, Text } from "@mantine/core"
import type { Metadata } from "next"

import { Logo } from "@/src/components/brand/Logo"

import { LoginForm } from "@/src/components/auth/LoginForm"

export const metadata: Metadata = { title: "Masuk Siswa · Maxima Stiftung" }

export default async function StudentLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams

  return (
    <Box className="grid-2 gap-0" mih="100dvh" bg="var(--canvas)">
      <Center p="xl">
        <Stack gap="xl" w="100%" maw={380}>
          <Logo height={56} priority />

          <Stack gap={6}>
            <h1 className="h3">Selamat datang.</h1>
            <Text size="18px" fw={300} c="dimmed" lh={1.4}>
              Masuk untuk melihat pembayaran, kelas, dan berkas Anda.
            </Text>
          </Stack>

          <LoginForm
            kind="student"
            next={next}
            identityLabel="Email"
            identityPlaceholder="nama@email.com"
          />

          <Text size="sm" c="dimmed">
            Belum mendaftar?{" "}
            <Anchor href="/register" size="sm" fw={600} c="var(--ink)">
              Isi formulir pendaftaran
            </Anchor>
          </Text>
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
          <Text ff="heading" fw={650} size="28px" lh={1.13} c="white">
            Belajar bahasa Jerman, bekerja di Jerman.
          </Text>
          <Text size="sm" c="rgba(255, 255, 255, 0.72)" lh={1.45}>
            Kursus bahasa, pemberkasan, pencarian perusahaan, sampai visa dan keberangkatan.
          </Text>
        </Stack>
      </Box>
    </Box>
  )
}
