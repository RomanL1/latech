FROM node:25-alpine

WORKDIR /app

ENV HOST=0.0.0.0
ENV PORT=3000

# Install dependencies (use ci for reproducible builds)
RUN npm install -g @y/websocket-server

EXPOSE 3000

CMD [ "y-wesocket-server" ]