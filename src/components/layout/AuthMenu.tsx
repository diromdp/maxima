"use client"

import { Avatar, Menu, Select, Stack, Text, UnstyledButton } from "@mantine/core"
import type { FloatingPosition } from "@mantine/core"
import { HugeiconsIcon } from "@hugeicons/react"
import { Building02Icon, Logout01Icon, UserAccountIcon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import { useState } from "react"

import { logout } from "@/src/lib/auth/actions"
import type { Session } from "@/src/lib/auth/session"

const ALL_BRANCHES = "__all__"

const BRANCHES = ["Bandung"] as const

export function AuthMenu({
  session,
  compact = false,
  menuPosition = "bottom-end",
}: {
  session: Session
  compact?: boolean
  menuPosition?: FloatingPosition
}) {
  const isStaff = session.kind === "staff"
  const locked = isStaff && session.branches !== null
  const [scope, setScope] = useState<string>(locked ? session.branches!.join(", ") : ALL_BRANCHES)
  const scopeLabel = scope === ALL_BRANCHES ? "Semua cabang" : scope

  const label = isStaff ? session.role : session.name
  const sub = isStaff ? scopeLabel : session.nis ? `NIS ${session.nis}` : session.status

  return (
    <Menu
      position={menuPosition}
      withArrow
      shadow="md"
      width={compact ? 240 : "target"}
      offset={8}
      closeOnItemClick={false}
    >
      <Menu.Target>
        <UnstyledButton
          aria-label={compact ? `Akun ${label}` : undefined}
          className="nav-row"
          px={compact ? 0 : 8}
          h={48}
          w={compact ? 40 : "100%"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: compact ? "center" : "flex-start",
            gap: 12,
            minWidth: 0,
            borderRadius: 9999,
          }}
        >
          <Avatar radius="xl" size={32} color="dark" variant="filled" style={{ flexShrink: 0 }}>
            {label.charAt(0).toUpperCase()}
          </Avatar>

          {!compact && (
            <Stack gap={0} style={{ minWidth: 0 }}>
              <Text size="13px" fw={500} truncate="end">
                {label}
              </Text>
              <Text size="12px" c="dimmed" truncate="end">
                {sub}
              </Text>
            </Stack>
          )}
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown p="xs">
        {isStaff ? (
          <>
            <Menu.Label px="xs" pt="xs">
              <Stack gap={2}>
                <Text size="sm" fw={600} c="var(--color-ink)" truncate="end">
                  {session.name}
                </Text>
                <Text size="xs" c="dimmed" truncate="end">
                  {session.role}
                </Text>
              </Stack>
            </Menu.Label>

            <Stack gap={4} px="xs" pb="xs">
              <Text size="xs" fw={600} c="dimmed">
                Cakupan cabang
              </Text>
              <Select
                size="sm"
                radius="xl"
                aria-label="Cakupan cabang"
                value={scope}
                onChange={(v) => v && setScope(v)}
                data={[
                  { value: ALL_BRANCHES, label: "Semua cabang" },
                  ...BRANCHES.map((b) => ({ value: b, label: b })),
                ]}
                disabled={locked}
                allowDeselect={false}
                leftSection={<HugeiconsIcon icon={Building02Icon} size={16} strokeWidth={1.5} />}
                comboboxProps={{ withinPortal: false, radius: "md" }}
              />
              {locked && (
                <Text size="xs" c="dimmed">
                  Ditetapkan oleh peran Anda.
                </Text>
              )}
            </Stack>

            <Menu.Item
              component={Link}
              href="/staff/profile"
              leftSection={<HugeiconsIcon icon={UserAccountIcon} size={16} strokeWidth={1.5} />}
            >
              Profil
            </Menu.Item>
          </>
        ) : (
          <Menu.Item
            component={Link}
            href="/portal/profile"
            leftSection={<HugeiconsIcon icon={UserAccountIcon} size={16} strokeWidth={1.5} />}
          >
            Profil
          </Menu.Item>
        )}

        <Menu.Divider />

        <form action={logout}>
          <Menu.Item
            component="button"
            type="submit"
            color="red"
            w="100%"
            leftSection={<HugeiconsIcon icon={Logout01Icon} size={16} strokeWidth={1.5} />}
          >
            Keluar
          </Menu.Item>
        </form>
      </Menu.Dropdown>
    </Menu>
  )
}
