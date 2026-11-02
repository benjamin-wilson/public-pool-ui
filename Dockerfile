############################
# Docker build environment #
############################

FROM node:lts-bookworm-slim AS build

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

# caddy:alpine ships no non-root user and runs as root by default. Create
# the conventional caddy user (uid/gid 1000) and su-exec so the entrypoint
# can drop privileges after its root-only config rendering.
RUN if getent group 1000 >/dev/null; then echo "group 1000 already exists" >&2; exit 1; fi \
    && if getent passwd 1000 >/dev/null; then echo "uid 1000 already exists" >&2; exit 1; fi \
    && addgroup -S -g 1000 caddy \
    && adduser -S -D -u 1000 -G caddy -h /nonexistent caddy \
    && apk add --no-cache su-exec

CMD ["/bin/sh", "/entrypoint.sh"]
