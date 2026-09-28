import { readQuery } from "@/src/lib/api/read"

import type { PrintTemplate, PrintTemplateCode } from "./schema"

export const printTemplatesQuery = () =>
  readQuery<{ data: PrintTemplate[] }>("print-templates", "/print-templates")

export const previewHref = (code: PrintTemplateCode): string =>
  `/api/download/print-templates/${code}/preview`
