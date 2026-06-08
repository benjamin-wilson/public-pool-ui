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

    expect(service.apiUrl).toBe('http://localhost:3334');
    expect(service.stratumUrl).toBe('public-pool.io:3333');
    expect(service.secureStratumUrl).toBe('public-pool.io:4333');
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
});
