FROM node:25-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN addgroup -g 1001 -S nodeapp && adduser -S nodeapp -u 1001 -G nodeapp
RUN chown -R nodeapp:nodeapp /app
USER nodeapp

ENV HOST=0.0.0.0
ENV PORT=3000

# Latech local/docker auth config
ENV API_INTERNAL_URL=http://api:5001
ENV INTERNAL_AUTH_SECRET=d1994d751e106da55475cc5aadfb3e742b2c849bdb961b420a934e094108965f

EXPOSE 3000

CMD [ "npm", "start" ]