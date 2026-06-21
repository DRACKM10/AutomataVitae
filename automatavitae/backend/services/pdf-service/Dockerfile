FROM node:20-alpine

WORKDIR /app

# Instalar Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser



CMD ["npm", "start"]
