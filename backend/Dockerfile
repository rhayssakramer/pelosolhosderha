FROM node:24-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
COPY .env.production ./
RUN DATABASE_URL="postgresql://dummy:dummy@localhost/dummy" npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build   # agora só compila com tsc

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
