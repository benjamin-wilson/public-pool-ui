############################
# Docker build environment #
############################

FROM node:18.16.1-bookworm AS build

WORKDIR /build

COPY . .

RUN npm i
RUN npm run build

############################
# Docker final environment #
############################

FROM caddy:2.7.4-alpine

EXPOSE 80
WORKDIR /var/www/html

COPY --from=build /build/dist/public-pool-ui .
COPY docker/Caddyfile.tpl /etc/Caddyfile.tpl
COPY docker/entrypoint.sh /entrypoint.sh

CMD ["/bin/sh", "/entrypoint.sh"]
