#!/bin/sh

if [ ! -e "/etc/Caddyfile" ]; then
    sed -i "s#%%LOGLEVEL%%#${LOGLEVEL:-INFO}#g" /etc/Caddyfile.tpl
    sed -i "s#%%LOGFORMAT%%#${LOGFORMAT:-json}#g" /etc/Caddyfile.tpl
    mv /etc/Caddyfile.tpl /etc/Caddyfile
else
    rm -f /etc/Caddyfile.tpl
fi

echo "Starting UI: http://${DOMAIN:-localhost}"
echo "Logs output: ${LOGLEVEL:-INFO} (${LOGFORMAT:-json})"

exec caddy run --config /etc/Caddyfile
