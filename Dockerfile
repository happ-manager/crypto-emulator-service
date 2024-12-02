# Стадия сборки
FROM node:20 AS builder
WORKDIR /app
COPY package.json ./
RUN yarn install
COPY . .
RUN yarn run build:prod

# Стадия выполнения
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
ENTRYPOINT ["node", "./dist/main.js"]
