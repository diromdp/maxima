import { z } from "zod"

export const profileFormSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi.").max(120, "Nama paling banyak 120 huruf."),
})

export type ProfileForm = z.infer<typeof profileFormSchema>
