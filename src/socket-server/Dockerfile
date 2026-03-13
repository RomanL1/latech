FROM node:25-alpine

WORKDIR /app

# Install dependencies (use ci for reproducible builds)
RUN npm install -g @y/websocket-server

CMD [ "y-websocket-server" ]