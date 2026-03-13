FROM oven/bun:latest AS build

ARG WEBSOCKET_SERVER_URL
ENV VITE_WS_HOST=$WEBSOCKET_SERVER_URL

WORKDIR /app
COPY src/frontend/package.json src/frontend/bun.lock src/frontend/bunfig.toml ./
RUN bun ci
COPY src/frontend ./
RUN bun run build

FROM nginx:alpine AS production

RUN rm -rf /usr/share/nginx/html/*

COPY src/frontend/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
