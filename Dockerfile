FROM node:15-alpine

WORKDIR /build
COPY package*.json ./
RUN npm ci

COPY tsconfig.json .
COPY /src ./src

RUN npm run build

FROM node:15-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=0 /build/dist ./dist

CMD ["node", "./dist/index.js"]
