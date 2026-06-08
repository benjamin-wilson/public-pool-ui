function hasOwn(env, key) {
  return Object.prototype.hasOwnProperty.call(env, key);
}

export function onRequestGet(context) {
  const config = {};

  if (hasOwn(context.env, 'PUBLIC_POOL_API_URL')) {
    config.API_URL = context.env.PUBLIC_POOL_API_URL;
  }

  if (hasOwn(context.env, 'PUBLIC_POOL_STRATUM_URL')) {
    config.STRATUM_URL = context.env.PUBLIC_POOL_STRATUM_URL;
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
