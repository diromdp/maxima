"use client"

import { Avatar, Menu, Select, Stack, Text, UnstyledButton } from "@mantine/core"
import type { FloatingPosition } from "@mantine/core"
import { HugeiconsIcon } from "@hugeicons/react"
import { Building02Icon, Logout01Icon, UserAccountIcon } from "@hugeicons/core-free-icons"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useEffect, useSyncExternalStore } from "react"

import { logout } from "@/src/lib/auth/actions"
import { BRANCH_COOKIE } from "@/src/lib/auth/paths"
import type { Session } from "@/src/lib/auth/session"

const ALL_BRANCHES = "__all__"
const BRANCH_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

// Cookie cabang dibaca proxy dan diteruskan ke API sebagai X-Branch; semua menu akun
// (sidebar, top bar, drawer) berlangganan ke cookie yang sama supaya pilihannya seragam.
const branchListeners = new Set<() => void>()

function subscribeBranch(listener: () => void): () => void {
  branchListeners.add(listener)
  return () => branchListeners.delete(listener)
}

const readBranchCookie = (): string | null =>
  document.cookie.match(new RegExp(`(?:^|; )${BRANCH_COOKIE}=([^;]*)`))?.[1] ?? null

function writeBranchCookie(branch: string | null): void {
  document.cookie = branch
    ? `${BRANCH_COOKIE}=${branch}; path=/; max-age=${BRANCH_COOKIE_MAX_AGE}; samesite=lax`
    : `${BRANCH_COOKIE}=; path=/; max-age=0`
  branchListeners.forEach((listener) => listener())
}

export function AuthMenu({
  session,
  compact = false,
  menuPosition = "bottom-end",
}: {
  session: Session
  compact?: boolean
  menuPosition?: FloatingPosition
}) {
  const queryClient = useQueryClient()
  const isStaff = session.kind === "staff"
  const ownBranches = isStaff ? session.branches : null
  const branchOptions = isStaff ? session.branchOptions : []
  const isLocked = branchOptions.length < 2
  const chosenBranch = useSyncExternalStore(subscribeBranch, readBranchCookie, () =>
    isStaff ? session.selectedBranch : null,
  )
  const selected = branchOptions.find((branch) => branch.id === chosenBranch)
  const allLabel = ownBranches ? ownBranches.join(", ") : "Semua cabang"
  const scope = selected?.id ?? ALL_BRANCHES
  const scopeLabel = selected?.name ?? allLabel

  const selectBranch = (value: string) => {
    writeBranchCookie(value === ALL_BRANCHES ? null : value)
    void queryClient.invalidateQueries()
  }

  const isStaleChoice = isStaff && chosenBranch !== null && selected === undefined
  useEffect(() => {
    if (isStaleChoice) selectBranch(ALL_BRANCHES)
  })

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
                onChange={(value) => value && selectBranch(value)}
                data={[
                  { value: ALL_BRANCHES, label: allLabel },
                  ...branchOptions.map((branch) => ({ value: branch.id, label: branch.name })),
                ]}
                disabled={isLocked}
                allowDeselect={false}
                leftSection={<HugeiconsIcon icon={Building02Icon} size={16} strokeWidth={1.5} />}
                comboboxProps={{ withinPortal: false, radius: "md" }}
              />
              {isLocked && ownBranches && (
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
