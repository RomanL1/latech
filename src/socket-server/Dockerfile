FROM node:25-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use ci for reproducible builds)
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Run as non-root user
RUN addgroup -g 1001 -S nodeapp && adduser -S nodeapp -u 1001 -G nodeapp
RUN chown -R nodeapp:nodeapp /app
USER nodeapp

# Bind to all interfaces so the server is accessible from outside the container
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 0000

CMD [ "npm", "start" ]
