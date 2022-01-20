FROM node:16 as builder
RUN apt update
RUN apt -y install openjdk-11-jre

WORKDIR /build

COPY package.json yarn.lock ./

RUN yarn install

COPY  . . 
RUN ls -a

RUN yarn build

FROM node:16 as build-final

WORKDIR /build
COPY package.json yarn.lock ./

RUN yarn install --production

COPY --from=builder /build/public/ ./

COPY . .

RUN ls -a ./
FROM gcr.io/distroless/nodejs:16
ENV NODE_ENV=production

WORKDIR /app
COPY --from=build-final /build/ ./

CMD ["index.js"]