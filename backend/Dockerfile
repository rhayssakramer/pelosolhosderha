FROM node:24-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src
COPY *.mjs ./
COPY setup-schema.js ./
RUN npx prisma generate
RUN npm run build

# ✅ Adicione essas linhas para rodar migration ao iniciar
ENV NODE_ENV=production
RUN npx prisma migrate deploy --skip-generate || true

EXPOSE 3000

CMD ["node", "dist/index.js"]
