export type PrintTemplateCode =
  "receipt" | "report-card" | "active-student-letter" | "progress-letter"

export type PrintTemplate = {
  readonly code: PrintTemplateCode
  readonly name: string
  readonly fileName: string
  readonly updatedOn: string
}
