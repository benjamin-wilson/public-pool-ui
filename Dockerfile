############################
# Docker build environment #
############################

FROM node:lts-bookworm-slim AS build

WORKDIR /build

COPY package*.json ./

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends python3 build-essential && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    npm install

COPY . .

ENV NODE_ENV=production
RUN npm run build

############################
# Docker final environment #
############################

FROM caddy:alpine AS final

EXPOSE 80
WORKDIR /var/www/html

COPY --from=build /build/dist/public-pool-ui .
COPY docker/Caddyfile.tpl /etc/Caddyfile.tpl
COPY docker/entrypoint.sh /entrypoint.sh

CMD ["sh", "-c", "/entrypoint.sh"]
