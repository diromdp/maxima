export function monthlyInstallmentOf(
  priceIdr: number | "",
  dpIdr: number | "",
  durationMonths: number | "",
): number | "" {
  if (priceIdr === "" || durationMonths === "" || durationMonths <= 0) return ""
  const monthly = Math.floor((priceIdr - (dpIdr === "" ? 0 : dpIdr)) / durationMonths)
  return monthly > 0 ? monthly : ""
}
