############################
# Docker build environment #
############################

FROM node:18.16.1-bookworm-slim AS build

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

FROM nginx:alpine
#change listen port to something different (8778)
RUN sed -i 's/80/8778/g' /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
COPY --from=build /build/dist/public-pool-ui .
