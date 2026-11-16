FROM node:20-alpine AS base
WORKDIR /app
# Prisma needs OpenSSL to pick the correct engine on Alpine (build AND runtime).
RUN apk add --no-cache openssl

# Install dependencies (needs package-lock.json)
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Build the Next.js application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Full toolbox image: Prisma CLI, tsx and the source code.
# Used by compose for database migrations, seeding and the reminder worker.
FROM builder AS tools
ENV NODE_ENV=production
USER node

# Small production image for the web app
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as a non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Generated Prisma client (belt and braces; standalone usually includes it)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
