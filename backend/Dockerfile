FROM node:24-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src
COPY *.mjs ./
RUN npx prisma generate
RUN npm run build   # compila com tsc

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
