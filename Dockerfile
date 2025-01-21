# Стадия сборки
FROM node:20 AS builder
WORKDIR /app

# Копируем только необходимые файлы для установки зависимостей
COPY package*.json ./

# Экспортируем NPM_TOKEN как переменную окружения
ARG NPM_TOKEN
ENV NPM_TOKEN=${NPM_TOKEN}

# Установка зависимостей
RUN npm ci --only=production

# Устанавливаем NestJS CLI глобально
RUN npm install -g @nestjs/cli

# Копируем остальной код
COPY . .

# Сборка приложения
RUN npm run build:prod

# Стадия выполнения
FROM node:20-alpine
WORKDIR /app

# Копируем только production-зависимости
COPY --from=builder /app/node_modules ./node_modules

# Копируем собранный код
COPY --from=builder /app/dist ./dist

# Копируем сертификат, если он необходим
COPY --from=builder /app/ca-certificate.crt ./ca-certificate.crt

# Настраиваем порт
EXPOSE 3000

# Указываем команду запуска
ENTRYPOINT ["node", "./dist/main.js"]
