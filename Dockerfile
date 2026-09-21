# --- STAGE 1: deps ---
    FROM node:22-alpine AS deps
    # Tambahkan libc6-compat karena sering dibutuhkan oleh Next.js di Alpine Linux
    RUN apk add --no-cache libc6-compat
    WORKDIR /app
    
    RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
    
    # Copy file package manager
    COPY package.json pnpm-lock.yaml .npmrc* ./
    
    # Install dependensi
    RUN pnpm install --frozen-lockfile
    
    # --- STAGE 2: builder ---
    FROM node:22-alpine AS builder
    WORKDIR /app
    RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
    
    # Reuse node_modules dari stage deps
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    
    # Hapus paksa file workspace (jika tak sengaja terbawa) agar pnpm tidak error
    RUN rm -f pnpm-workspace.yaml
    
    ENV NEXT_TELEMETRY_DISABLED=1
    
    # Build aplikasi Next.js
    RUN pnpm run build
    
    # --- STAGE 3: runner (image final) ---
    FROM node:22-alpine AS runner
    WORKDIR /app
    
    ENV NODE_ENV=production
    ENV NEXT_TELEMETRY_DISABLED=1
    ENV HOST=0.0.0.0
    ENV PORT=3000
    
    # Buat user non-root untuk keamanan
    RUN addgroup -g 1001 -S nodejs
    RUN adduser -S nextjs -u 1001
    
    # Copy direktori public
    COPY --from=builder /app/public ./public
    
    # Buat folder .next dengan permission yang benar
    RUN mkdir .next
    RUN chown nextjs:nodejs .next
    
    # Copy output standalone dan file statis Next.js
    COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
    COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
    
    USER nextjs
    
    EXPOSE 3000
    
    # Standalone output menghasilkan server.js di root
    CMD ["node", "server.js"]