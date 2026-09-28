"use client"

import { useQuery } from "@tanstack/react-query"

import type { ApiError } from "./errors"
import { readApi, type ReadQuery } from "./read"

export function useRead<T>(read: ReadQuery<T>) {
  return useQuery<T, ApiError>({ queryKey: read.queryKey, queryFn: () => readApi(read) })
}
