import type { Page } from "@/src/lib/api/errors"
import { readQuery, type ReadQuery } from "@/src/lib/api/read"
import type { ListParams } from "@/src/lib/list-query"

import type { PAYMENT_FILTERS, PaymentDetail, PaymentRow, PaymentStudentOption } from "./schema"

export type PaymentListParams = ListParams<(typeof PAYMENT_FILTERS)[number]>

export const PAYMENT_KEYS = [["payments"], ["payments-pending"]] as const

export const paymentsQuery = (params: PaymentListParams) =>
  readQuery<Page<PaymentRow>>("payments", "/payments", params)

export const pendingPaymentsQuery = () =>
  readQuery<{ total: number }>("payments-pending", "/payments/pending-count")

export const paymentQuery = (id: string): ReadQuery<PaymentDetail> => ({
  queryKey: ["payments", id],
  path: `/payments/${id}`,
})

export const paymentStudentsQuery = (search: string) =>
  readQuery<{ data: PaymentStudentOption[] }>("payment-students", "/payments/students", {
    search,
  })
