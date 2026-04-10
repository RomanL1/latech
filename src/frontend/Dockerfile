FROM oven/bun:latest AS build

ARG WEBSOCKET_SERVER_URL
ENV VITE_WS_HOST=$WEBSOCKET_SERVER_URL
ARG VITE_API_HOST
ENV VITE_API_HOST=$VITE_API_HOST

WORKDIR /app
COPY package.json bun.lock bunfig.toml ./
RUN bun ci
COPY . ./
RUN bun run build

FROM nginx:alpine AS production

RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
