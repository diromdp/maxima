"use server"

import { actionOf, api, type ActionResult } from "@/src/lib/api/client"
import { requireSession } from "@/src/lib/auth/session"

import {
  CENTS_PER_EURO,
  type GatePreview,
  type PackageForm,
  type PackageView,
  type PromoForm,
} from "./schema"

const nullable = (value: number | "") => (value === "" ? null : value)

function withFields<T>(result: ActionResult<T>, fieldOf: (apiField: string) => string) {
  if (result.ok) return result
  const fieldErrors = Object.fromEntries(
    Object.entries(result.fieldErrors).map(([field, message]) => [fieldOf(field), message]),
  )
  return { ...result, fieldErrors }
}

const packageField = (field: string) =>
  field === "serviceFeeEurCents" ? "serviceFeeEur" : field.replace(/^thresholds\./, "gates.")

const promoField = (field: string) =>
  field === "percent" || field === "amountIdr" ? "value" : field

function thresholdsOf(gates: PackageForm["gates"]) {
  return Object.fromEntries(Object.entries(gates).map(([id, value]) => [id, nullable(value)]))
}

export type PackageTarget = { id: string; code: string } | null

function packageBody(form: PackageForm, dpGateId: string, target: PackageTarget) {
  return {
    ...(form.code === "" || form.code === target?.code ? {} : { code: form.code }),
    name: form.name,
    programId: form.programId,
    priceIdr: nullable(form.priceIdr),
    serviceFeeEurCents:
      form.serviceFeeEur === "" ? null : Math.round(form.serviceFeeEur * CENTS_PER_EURO),
    dpIdr: nullable(form.gates[dpGateId] ?? "") ?? 0,
    durationMonths: nullable(form.durationMonths),
    monthlyIdr: nullable(form.monthlyIdr),
    billingDay: nullable(form.billingDay),
    bridgingFundIdr: form.bridgingFundIdr,
    bridgingFundEur: form.bridgingFundEur,
    status: form.status,
    levelIds: form.levelIds,
  }
}

export async function previewPackageGates(
  id: string,
  gates: PackageForm["gates"],
): Promise<ActionResult<GatePreview>> {
  await requireSession("staff")
  return withFields(
    await actionOf(() =>
      api<GatePreview>(`/packages/${id}/gates/preview`, {
        method: "POST",
        body: { thresholds: thresholdsOf(gates) },
      }),
    ),
    packageField,
  )
}

export async function savePackage(
  target: PackageTarget,
  form: PackageForm,
  dpGateId: string,
): Promise<ActionResult<PackageView>> {
  await requireSession("staff")
  const body = packageBody(form, dpGateId, target)
  return withFields(
    await actionOf(async () => {
      const saved = target
        ? await api<PackageView>(`/packages/${target.id}`, { method: "PATCH", body })
        : await api<PackageView>("/packages", { method: "POST", body })
      return api<PackageView>(`/packages/${saved.id}/gates`, {
        method: "PUT",
        body: { thresholds: thresholdsOf(form.gates) },
      })
    }),
    packageField,
  )
}

export async function removePackage(id: string): Promise<ActionResult> {
  await requireSession("staff")
  return actionOf(async () => {
    await api(`/packages/${id}`, { method: "DELETE" })
    return null
  })
}

function promoBody(form: PromoForm) {
  const value = Number(form.value)
  return {
    code: form.code,
    name: form.name,
    startsOn: form.startsOn,
    endsOn: form.endsOn,
    status: form.status,
    packageIds: form.packageIds,
    discountType: form.discountType,
    percent: form.discountType === "Persentase" ? value : null,
    amountIdr: form.discountType === "Nominal" ? value : null,
  }
}

export async function savePromo(id: string | null, form: PromoForm): Promise<ActionResult> {
  await requireSession("staff")
  return withFields(
    await actionOf(async () => {
      await api(id ? `/promos/${id}` : "/promos", {
        method: id ? "PUT" : "POST",
        body: promoBody(form),
      })
      return null
    }),
    promoField,
  )
}

export async function removePromo(id: string): Promise<ActionResult> {
  await requireSession("staff")
  return actionOf(async () => {
    await api(`/promos/${id}`, { method: "DELETE" })
    return null
  })
}
