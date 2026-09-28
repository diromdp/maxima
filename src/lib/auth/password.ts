import { z } from "zod"

export const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 200

export const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Isi kata sandi saat ini."),
    newPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`)
      .max(MAX_PASSWORD_LENGTH, `Kata sandi paling banyak ${MAX_PASSWORD_LENGTH} karakter.`),
    confirmPassword: z.string(),
  })
  .refine((form) => form.newPassword !== form.currentPassword, {
    message: "Kata sandi baru harus berbeda dari kata sandi sekarang.",
    path: ["newPassword"],
  })
  .refine((form) => form.confirmPassword === form.newPassword, {
    message: "Ulangan kata sandi belum sama.",
    path: ["confirmPassword"],
  })

export type PasswordForm = z.infer<typeof passwordFormSchema>
