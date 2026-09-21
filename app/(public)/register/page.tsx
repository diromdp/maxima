import { Anchor, Box, Container, Group, Text } from "@mantine/core"
import type { Metadata } from "next"

import { Logo } from "@/src/components/brand/Logo"

import { RegisterForm } from "./RegisterForm"

export const metadata: Metadata = { title: "Formulir Pendaftaran · Maxima Stiftung" }

export default function RegisterPage() {
  return (
    <Box bg="ink.0" mih="100dvh">
      <Box
        component="header"
        bg="white"
        h={72}
        style={{ borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "center" }}
      >
        <Container size="md" w="100%">
          <Group justify="space-between" align="center" wrap="nowrap">
            <Anchor
              href="/"
              style={{ display: "flex", alignItems: "center" }}
              aria-label="Maxima Stiftung"
            >
              <Logo className="hide-mobile" height={48} priority />
              <Logo className="only-mobile" height={36} priority />
            </Anchor>
            <Text size="sm" c="dimmed">
              Sudah punya akun?{" "}
              <Anchor href="/" size="sm">
                Masuk
              </Anchor>
            </Text>
          </Group>
        </Container>
      </Box>

      <Container size="md" py="xl">
        <RegisterForm />
      </Container>
    </Box>
  )
}
