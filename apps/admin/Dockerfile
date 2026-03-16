FROM node:22-alpine AS base

WORKDIR /app

# Install pnpm (monorepo root에 pnpm-lock.yaml 존재 → Next.js가 pnpm 감지)
RUN npm install -g pnpm@9

# Copy root workspace files
COPY package.json pnpm-workspace.yaml ./

# Copy admin package
COPY apps/admin/package.json apps/admin/package.json

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy admin source
COPY apps/admin/ apps/admin/

# Build
WORKDIR /app/apps/admin
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=base /app/apps/admin/.next/standalone ./
COPY --from=base /app/apps/admin/.next/static ./apps/admin/.next/static

EXPOSE 3002
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/admin/server.js"]
