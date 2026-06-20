function hasOwn(env, key) {
  return Object.prototype.hasOwnProperty.call(env, key);
}

const runtimeEnvMap = {
  PUBLIC_POOL_API_URL: 'API_URL',
  PUBLIC_POOL_STRATUM_URL: 'STRATUM_URL',
  PUBLIC_POOL_SECURE_STRATUM_URL: 'SECURE_STRATUM_URL',
  PUBLIC_POOL_STRATUM_V2_URL: 'STRATUM_V2_URL',
  PUBLIC_POOL_PPLNS_STRATUM_URL: 'PPLNS_STRATUM_URL',
  PUBLIC_POOL_PPLNS_SECURE_STRATUM_URL: 'PPLNS_SECURE_STRATUM_URL',
  PUBLIC_POOL_PPLNS_STRATUM_V2_URL: 'PPLNS_STRATUM_V2_URL',
  PUBLIC_POOL_PPLNS_DATUM_URL: 'PPLNS_DATUM_URL'
};

const publicPoolDefaults = {
  API_URL: 'https://public-pool.io:40557',
  STRATUM_URL: 'public-pool.io:3333',
  SECURE_STRATUM_URL: 'public-pool.io:4333',
  STRATUM_V2_URL: 'public-pool.io:23330',
  PPLNS_STRATUM_URL: 'public-pool.io:13333',
  PPLNS_SECURE_STRATUM_URL: 'public-pool.io:14333',
  PPLNS_STRATUM_V2_URL: 'public-pool.io:23331',
  PPLNS_DATUM_URL: 'public-pool.io:23336'
};

export function onRequestGet(context) {
  const config = { ...publicPoolDefaults };

  for (const [envKey, configKey] of Object.entries(runtimeEnvMap)) {
    if (hasOwn(context.env, envKey)) {
      config[configKey] = context.env[envKey];
    }
  }

  return new Response(
    `window.__PUBLIC_POOL_CONFIG__ = ${JSON.stringify(config)};\n`,
    {
      headers: {
        'content-type': 'application/javascript; charset=utf-8',
        'cache-control': 'no-store'
      }
    }
  );
}
