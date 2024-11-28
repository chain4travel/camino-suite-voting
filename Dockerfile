ARG BUILD_ENV="build:dev"
FROM node:18
ARG BUILD_ENV
WORKDIR /app/camino-suite-voting
COPY ./ /app/camino-suite-voting/
RUN yarn install
RUN yarn $BUILD_ENV