FROM oven/bun:latest AS build

WORKDIR /app
COPY src/frontend/package.json src/frontend/bun.lock src/frontend/bunfig.toml ./
RUN bun ci
COPY src/frontend ./
RUN bun run build

FROM nginx:alpine AS production

RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
