import type { Page } from "@/src/lib/api/errors"
import { readQuery, type ReadQuery } from "@/src/lib/api/read"

import type { RegistrationListRow, RegistrationOptions, RegistrationView } from "./schema"

const DRAFT_LIMIT = 10

export const draftRegistrationsQuery = () =>
  readQuery<Page<RegistrationListRow>>("registrations", "/registrations", {
    submitted: "false",
    perPage: DRAFT_LIMIT,
  })

export const registrationOptionsQuery = () =>
  readQuery<RegistrationOptions>("registration-options", "/registrations/options")

export const registrationQuery = (studentId: string): ReadQuery<RegistrationView> => ({
  queryKey: ["registrations", studentId],
  path: `/registrations/${studentId}`,
})

export const myRegistrationQuery = () =>
  readQuery<RegistrationView>("registration-me", "/registrations/me")

export const myRegistrationOptionsQuery = () =>
  readQuery<RegistrationOptions>("registration-me-options", "/registrations/me/options")
