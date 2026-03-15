FROM node:22-alpine

WORKDIR /app

# Copy socket-server package.json (strip workspace: protocol for standalone npm install)
COPY apps/socket-server/package.json ./package.json
RUN node -e "const p=require('./package.json'); delete p.dependencies['@taeja/shared']; require('fs').writeFileSync('./package.json', JSON.stringify(p,null,2))" && npm install

# Copy @taeja/shared into node_modules and compile TS to JS using esbuild
COPY packages/shared /app/node_modules/@taeja/shared
RUN npx -y esbuild node_modules/@taeja/shared/src/index.ts --bundle --outfile=node_modules/@taeja/shared/dist/index.js --platform=node --format=cjs && \
    node -e "const p=require('./node_modules/@taeja/shared/package.json'); p.main='./dist/index.js'; require('fs').writeFileSync('./node_modules/@taeja/shared/package.json', JSON.stringify(p,null,2))"

COPY apps/socket-server/tsconfig.json ./
COPY apps/socket-server/src/ src/

RUN npm run build

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/index.js"]
