import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    API_URL: z.url(),
  },
  client: {
    NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: z.string().min(1),
    NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION: z.stringbool().default(false),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    API_URL: process.env.API_URL,
    NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION,
  },
  emptyStringAsUndefined: true,
})
