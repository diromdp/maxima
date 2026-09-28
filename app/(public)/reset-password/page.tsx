import { Card, Center, Stack, Text } from "@mantine/core"
import type { Metadata } from "next"

import { PasswordResetForm } from "@/src/components/auth/PasswordResetForm"
import { Logo } from "@/src/components/brand/Logo"
import { Notice } from "@/src/components/ui/Notice"

export const metadata: Metadata = { title: "Atur Kata Sandi · Maxima Stiftung" }

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  return (
    <Center mih="100dvh" p="md">
      <Stack gap="lg" w="100%" maw={400}>
        <Stack gap="xs" align="center">
          <Logo height={64} priority />
          <Text size="20px" fw={300} c="dimmed" ta="center">
            Buat kata sandi baru.
          </Text>
        </Stack>

        <Card padding="xl">
          {token ? (
            <PasswordResetForm token={token} />
          ) : (
            <Notice tone="warning">
              Tautan ini tidak lengkap. Buka tautan dari email Anda, atau minta tautan baru dari
              halaman masuk.
            </Notice>
          )}
        </Card>
      </Stack>
    </Center>
  )
}
