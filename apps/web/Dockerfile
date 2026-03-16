FROM node:22-slim

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy root package files
COPY package.json pnpm-workspace.yaml ./

# Copy packages
COPY packages/shared/package.json packages/shared/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/locales/package.json packages/locales/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/db/package.json packages/db/package.json

# Copy web app package
COPY apps/web/package.json apps/web/package.json

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY packages/ packages/
COPY apps/web/ apps/web/

# Re-link workspace dependencies after source copy
RUN pnpm install --no-frozen-lockfile

# Build
WORKDIR /app/apps/web
ARG JWT_SECRET=build-time-placeholder
ENV JWT_SECRET=$JWT_SECRET
ARG NEXT_PUBLIC_SUPABASE_URL=https://olewiswdeofvrmmcwpoh.supabase.co
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_G2pfL7Zfn7qNrlFXRvhWPQ_CplsTJd7
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL=https://thaijaworld.com
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SOCKET_URL=https://thaijaworld.com
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
RUN npm run build

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npx", "next", "start", "-p", "3000", "-H", "0.0.0.0"]
