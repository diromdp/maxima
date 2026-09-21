import { Card, Center, Stack, Text } from "@mantine/core"
import type { Metadata } from "next"

import { Logo } from "@/src/components/brand/Logo"

import { LoginForm } from "@/src/components/auth/LoginForm"

export const metadata: Metadata = { title: "Masuk Staf · Maxima Stiftung" }

export default async function StaffLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams

  return (
    <Center mih="100dvh" p="md">
      <Stack gap="lg" w="100%" maw={400}>
        <Stack gap="xs" align="center">
          <Logo height={64} priority />
          <Text size="20px" fw={300} c="dimmed">
            Masuk ke aplikasi staf.
          </Text>
        </Stack>

        <Card padding="xl">
          <LoginForm
            kind="staff"
            next={next}
            identityLabel="Email Staf"
            identityPlaceholder="jhon@example.com"
          />
        </Card>
      </Stack>
    </Center>
  )
}
