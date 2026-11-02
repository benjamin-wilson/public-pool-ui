#!/bin/sh

js_escape() {
    printf '%s' "$1" | sed 's#\\#\\\\#g; s#"#\\"#g'
}

write_runtime_config() {
    config="{"
    separator=""

    if [ "${PUBLIC_POOL_API_URL+x}" ]; then
        config="${config}${separator}\"API_URL\":\"$(js_escape "$PUBLIC_POOL_API_URL")\""
        separator=","
    fi

    if [ "${PUBLIC_POOL_STRATUM_URL+x}" ]; then
        config="${config}${separator}\"STRATUM_URL\":\"$(js_escape "$PUBLIC_POOL_STRATUM_URL")\""
    fi

    config="${config}}"

    cat > /var/www/html/assets/runtime-config.js <<EOF
window.__PUBLIC_POOL_CONFIG__ = ${config};
EOF
}

if [ ! -e "/etc/Caddyfile" ]; then
    sed -i "s#%%LOGLEVEL%%#${LOGLEVEL:-INFO}#g" /etc/Caddyfile.tpl
    sed -i "s#%%LOGFORMAT%%#${LOGFORMAT:-json}#g" /etc/Caddyfile.tpl
    mv /etc/Caddyfile.tpl /etc/Caddyfile
else
    rm -f /etc/Caddyfile.tpl
fi

write_runtime_config

echo "Starting UI on port 80"
echo "Logs output: ${LOGLEVEL:-INFO} (${LOGFORMAT:-json})"

# The root phase above rendered /etc/Caddyfile and runtime-config.js (both
# world-readable; caddy only reads them). Drop to the caddy user for the
# server process: the caddy binary carries the cap_net_bind_service file
# capability (from the caddy:alpine base), so it can still bind :80.
# Note: with a dropped bounding set (e.g. --cap-drop ALL), su-exec needs
# SETGID + SETUID and the setcap'd binary needs NET_BIND_SERVICE, so such
# setups require: --cap-add NET_BIND_SERVICE,SETGID,SETUID
# Note: no-new-privileges prevents the file capability from being
# granted (CapEff stays 0); caddy can then only bind :80 if port 80 is
# unprivileged in the container's network namespace. Docker sets
# net.ipv4.ip_unprivileged_port_start=0 in container netnses by default,
# so bridge-networked containers are unaffected; with network_mode: host
# (where the host value, typically 1024, applies) the bind fails - omit
# that security_opt for this container, or lower the host sysctl.
if [ "$(id -u)" = "0" ]; then
    exec su-exec caddy caddy run --config /etc/Caddyfile
fi

exec caddy run --config /etc/Caddyfile
