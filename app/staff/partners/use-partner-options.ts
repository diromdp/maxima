"use client"

import { partnersQuery } from "@/src/entities/partner/queries"
import { useRead } from "@/src/lib/api/use-read"

export function usePartnerOptions() {
  const partners = useRead(partnersQuery()).data?.data ?? []
  const optionOf = (partner: { id: string; name: string }) => ({
    value: partner.id,
    label: partner.name,
  })

  return {
    partners: partners.map(optionOf),
    activePartners: partners.filter((partner) => partner.status === "Aktif").map(optionOf),
    cities: [...new Set(partners.flatMap((partner) => (partner.city ? [partner.city] : [])))]
      .sort((left, right) => left.localeCompare(right))
      .map((city) => ({ value: city, label: city })),
  }
}
