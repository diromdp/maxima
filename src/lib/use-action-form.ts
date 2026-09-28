"use client"

import type { UseFormReturnType } from "@mantine/form"
import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query"
import { useState } from "react"

import { FALLBACK_MESSAGE, type ActionResult } from "./api/errors"
import { notify } from "./notify"

const UNAUTHORIZED = 401
const CONFLICT = 409

export function useActionForm<Values extends Record<string, unknown>, Result>({
  form,
  action,
  successMessage,
  invalidates = [],
  onSuccess,
}: {
  form: UseFormReturnType<Values>
  action: (values: Values) => Promise<ActionResult<Result>>
  successMessage: string
  invalidates?: readonly QueryKey[]
  onSuccess?: (data: Result) => void
}) {
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)
  const mutation = useMutation({ mutationFn: action })

  const submit = form.onSubmit(async (values) => {
    setFormError(null)
    const result = await mutation.mutateAsync(values).catch(() => null)
    if (!result) {
      notify.error(FALLBACK_MESSAGE)
      return
    }
    if (result.ok) {
      notify.success(successMessage)
      await Promise.all(invalidates.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
      onSuccess?.(result.data)
      return
    }
    if (result.status === UNAUTHORIZED) window.location.reload()
    else if (Object.keys(result.fieldErrors).length > 0) form.setErrors(result.fieldErrors)
    else if (result.status === CONFLICT) setFormError(result.message)
    else notify.error(result.message)
  })

  return { submit, isPending: mutation.isPending, formError }
}
