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

ENV NODE_ENV=production

EXPOSE 3000

# Rodar migration ao iniciar o container
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
