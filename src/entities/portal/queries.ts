import { readQuery } from "@/src/lib/api/read"

import type {
  DepartureChecklist,
  OwnPlacement,
  PortalDashboard,
  PortalLearning,
  PortalPartners,
  PortalPayments,
  PortalProfile,
  PortalProgress,
} from "./schema"

export const portalDashboardQuery = () =>
  readQuery<PortalDashboard>("portal-dashboard", "/portal/dashboard")

export const portalPaymentsQuery = () =>
  readQuery<PortalPayments>("portal-payments", "/portal/payments")

export const portalLearningQuery = () =>
  readQuery<PortalLearning>("portal-learning", "/portal/learning")

export const portalProgressQuery = () =>
  readQuery<PortalProgress>("portal-progress", "/portal/progress")

export const portalProfileQuery = () =>
  readQuery<PortalProfile>("portal-profile", "/portal/profile")

export const ownPartnersQuery = () => readQuery<PortalPartners>("own-partners", "/partners/me")

export const ownPlacementQuery = () =>
  readQuery<OwnPlacement>("own-placement", "/visa-placements/me")

export const departureChecklistQuery = () =>
  readQuery<DepartureChecklist>("departure-checklist", "/visa-placements/me/checklist")
