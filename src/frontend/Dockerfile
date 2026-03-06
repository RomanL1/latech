FROM oven/bun:latest AS build

WORKDIR /app
COPY package.json bun.lock bunfig.toml ./
RUN bun ci
COPY . ./
RUN bun run build

FROM nginx:alpine AS production

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
