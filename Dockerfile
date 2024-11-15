FROM node:20.12.2-alpine3.18

RUN npm install --global pnpm

WORKDIR /app

COPY . .
RUN pnpm install

EXPOSE 3336

CMD ["pnpm", "run", "dev"]
