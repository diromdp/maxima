import { ActionIcon, Group } from "@mantine/core"
import { HugeiconsIcon } from "@hugeicons/react"
import { Menu01Icon } from "@hugeicons/core-free-icons"

import { Logo } from "@/src/components/brand/Logo"
import { AuthMenu } from "@/src/components/layout/AuthMenu"
import type { Session } from "@/src/lib/auth/session"

export function TopBar({ session, onMenuOpen }: { session: Session; onMenuOpen: () => void }) {
  return (
    <Group
      className="only-mobile"
      h={64}
      px="md"
      gap="sm"
      justify="space-between"
      bg="var(--canvas)"
      wrap="nowrap"
      style={{ borderBottom: "1px solid var(--hairline-soft)", flexShrink: 0 }}
    >
      <Group gap="sm" wrap="nowrap">
        <ActionIcon
          variant="subtle"
          color="gray"
          size={40}
          radius="xl"
          aria-label="Buka menu"
          onClick={onMenuOpen}
        >
          <HugeiconsIcon icon={Menu01Icon} size={22} strokeWidth={1.5} />
        </ActionIcon>

        <Logo height={36} />
      </Group>

      <AuthMenu session={session} compact />
    </Group>
  )
}
