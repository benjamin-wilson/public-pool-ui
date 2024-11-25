############################
# Docker build environment #
############################

FROM node:bookworm-slim AS build

# Upgrade all packages and install dependencies
RUN apt-get update \
    && apt-get upgrade -y
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        python3 \
        build-essential \
    && apt clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /build

COPY . .

# Build Public Pool UI using NPM
RUN npm i && npm run build

############################
# Docker final environment #
############################

FROM caddy:alpine AS final

EXPOSE 80
WORKDIR /var/www/html

COPY --from=build /build/dist/public-pool-ui .
COPY docker/Caddyfile.tpl /etc/Caddyfile.tpl
COPY docker/entrypoint.sh /entrypoint.sh

CMD ["/bin/sh", "/entrypoint.sh"]
