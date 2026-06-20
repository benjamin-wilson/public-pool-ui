import { AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
  let originalRuntimeConfig: typeof window.__PUBLIC_POOL_CONFIG__;

  beforeEach(() => {
    originalRuntimeConfig = window.__PUBLIC_POOL_CONFIG__;
    delete window.__PUBLIC_POOL_CONFIG__;
  });

  afterEach(() => {
    if (originalRuntimeConfig === undefined) {
      delete window.__PUBLIC_POOL_CONFIG__;
    } else {
      window.__PUBLIC_POOL_CONFIG__ = originalRuntimeConfig;
    }
  });

  it('uses compiled environment values when runtime config is absent', () => {
    const service = new AppConfigService();

    expect(service.apiUrl).toBe('');
    expect(service.stratumUrl).toBe('localhost:3333');
    expect(service.secureStratumUrl).toBe('localhost:4333');
    expect(service.stratumV2Url).toBe('localhost:23330');
    expect(service.pplnsStratumUrl).toBe('');
    expect(service.pplnsSecureStratumUrl).toBe('');
    expect(service.pplnsStratumV2Url).toBe('');
    expect(service.pplnsDatumUrl).toBe('');
  });

  it('uses same-origin API requests when runtime API_URL is explicitly empty', () => {
    window.__PUBLIC_POOL_CONFIG__ = {
      API_URL: ''
    };

    const service = new AppConfigService();

    expect(service.apiUrl).toBe('');
  });

  it('uses the browser hostname when runtime STRATUM_URL is explicitly empty', () => {
    window.__PUBLIC_POOL_CONFIG__ = {
      STRATUM_URL: ''
    };

    const service = new AppConfigService();

    expect(service.stratumUrl).toBe(`${window.location.hostname}:3333`);
  });

  it('uses the browser hostname when runtime SECURE_STRATUM_URL is explicitly empty', () => {
    window.__PUBLIC_POOL_CONFIG__ = {
      SECURE_STRATUM_URL: ''
    };

    const service = new AppConfigService();

    expect(service.secureStratumUrl).toBe(`${window.location.hostname}:4333`);
  });

  it('normalizes a runtime API_URL with trailing slashes', () => {
    window.__PUBLIC_POOL_CONFIG__ = {
      API_URL: 'https://example.com///'
    };

    const service = new AppConfigService();

    expect(service.apiUrl).toBe('https://example.com');
  });

  it('uses runtime PPLNS connection URLs when present', () => {
    window.__PUBLIC_POOL_CONFIG__ = {
      PPLNS_STRATUM_URL: 'public-pool.io:13333',
      PPLNS_SECURE_STRATUM_URL: 'public-pool.io:14333',
      PPLNS_STRATUM_V2_URL: 'public-pool.io:23331',
      PPLNS_DATUM_URL: 'public-pool.io:23336'
    };

    const service = new AppConfigService();

    expect(service.pplnsStratumUrl).toBe('public-pool.io:13333');
    expect(service.pplnsSecureStratumUrl).toBe('public-pool.io:14333');
    expect(service.pplnsStratumV2Url).toBe('public-pool.io:23331');
    expect(service.pplnsDatumUrl).toBe('public-pool.io:23336');
  });
});
