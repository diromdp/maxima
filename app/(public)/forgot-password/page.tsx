import { Anchor, Card, Center, Stack, Text } from "@mantine/core"
import type { Metadata } from "next"

import { PasswordRequestForm } from "@/src/components/auth/PasswordRequestForm"
import { Logo } from "@/src/components/brand/Logo"
import { loginPath } from "@/src/lib/auth/paths"

export const metadata: Metadata = { title: "Lupa Kata Sandi · Maxima Stiftung" }

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>
}) {
  const { kind: asked } = await searchParams
  const kind = asked === "staff" ? "staff" : "student"

  return (
    <Center mih="100dvh" p="md">
      <Stack gap="lg" w="100%" maw={400}>
        <Stack gap="xs" align="center">
          <Logo height={64} priority />
          <Text size="20px" fw={300} c="dimmed" ta="center">
            Kirim tautan untuk mengganti kata sandi.
          </Text>
        </Stack>

        <Card padding="xl">
          <PasswordRequestForm kind={kind} />
        </Card>

        <Anchor href={loginPath(kind)} size="sm" c="dimmed" ta="center">
          Kembali ke halaman masuk
        </Anchor>
      </Stack>
    </Center>
  )
}
