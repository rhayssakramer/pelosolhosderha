FROM node:24-alpine

WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY backend/prisma ./prisma
COPY backend/tsconfig.json ./
COPY backend/src ./src
COPY backend/*.mjs ./
COPY create_admin_direct.mjs ./
RUN npx prisma generate
RUN npm run build   # compila com tsc

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
