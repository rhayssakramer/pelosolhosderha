FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json esbuild.config.js ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

RUN mkdir -p uploads

EXPOSE 3000
ENV NODE_ENV=production

CMD ["sh", "-c", "npx prisma migrate resolve --applied 20260528134716_pelosolhosderha 2>/dev/null; npx prisma migrate deploy && node dist/index.js"]
