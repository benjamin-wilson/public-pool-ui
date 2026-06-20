import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

interface RuntimeConfig {
  API_URL?: string;
  STRATUM_URL?: string;
  SECURE_STRATUM_URL?: string;
  STRATUM_V2_URL?: string;
  PPLNS_STRATUM_URL?: string;
  PPLNS_SECURE_STRATUM_URL?: string;
  PPLNS_STRATUM_V2_URL?: string;
  PPLNS_DATUM_URL?: string;
}

declare global {
  interface Window {
    __PUBLIC_POOL_CONFIG__?: RuntimeConfig;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  public get apiUrl(): string {
    if (this.hasRuntimeValue('API_URL')) {
      return this.normalizeBaseUrl(window.__PUBLIC_POOL_CONFIG__?.API_URL);
    }

    return this.normalizeBaseUrl(environment.API_URL);
  }

  public get stratumUrl(): string {
    if (this.hasRuntimeValue('STRATUM_URL')) {
      return this.resolveStratumUrl(window.__PUBLIC_POOL_CONFIG__?.STRATUM_URL);
    }

    return this.resolveStratumUrl(environment.STRATUM_URL);
  }

  public get secureStratumUrl(): string {
    if (this.hasRuntimeValue('SECURE_STRATUM_URL')) {
      return this.resolveSecureStratumUrl(window.__PUBLIC_POOL_CONFIG__?.SECURE_STRATUM_URL);
    }

    return this.resolveSecureStratumUrl(environment.SECURE_STRATUM_URL);
  }

  public get stratumV2Url(): string {
    if (this.hasRuntimeValue('STRATUM_V2_URL')) {
      return this.resolveOptionalUrl(window.__PUBLIC_POOL_CONFIG__?.STRATUM_V2_URL);
    }

    return this.resolveOptionalUrl(environment.STRATUM_V2_URL);
  }

  public get pplnsStratumUrl(): string {
    if (this.hasRuntimeValue('PPLNS_STRATUM_URL')) {
      return this.resolveOptionalUrl(window.__PUBLIC_POOL_CONFIG__?.PPLNS_STRATUM_URL);
    }

    return this.resolveOptionalUrl(environment.PPLNS_STRATUM_URL);
  }

  public get pplnsSecureStratumUrl(): string {
    if (this.hasRuntimeValue('PPLNS_SECURE_STRATUM_URL')) {
      return this.resolveOptionalUrl(window.__PUBLIC_POOL_CONFIG__?.PPLNS_SECURE_STRATUM_URL);
    }

    return this.resolveOptionalUrl(environment.PPLNS_SECURE_STRATUM_URL);
  }

  public get pplnsStratumV2Url(): string {
    if (this.hasRuntimeValue('PPLNS_STRATUM_V2_URL')) {
      return this.resolveOptionalUrl(window.__PUBLIC_POOL_CONFIG__?.PPLNS_STRATUM_V2_URL);
    }

    return this.resolveOptionalUrl(environment.PPLNS_STRATUM_V2_URL);
  }

  public get pplnsDatumUrl(): string {
    if (this.hasRuntimeValue('PPLNS_DATUM_URL')) {
      return this.resolveOptionalUrl(window.__PUBLIC_POOL_CONFIG__?.PPLNS_DATUM_URL);
    }

    return this.resolveOptionalUrl(environment.PPLNS_DATUM_URL);
  }

  private hasRuntimeValue(key: keyof RuntimeConfig): boolean {
    return typeof window !== 'undefined'
      && !!window.__PUBLIC_POOL_CONFIG__
      && Object.prototype.hasOwnProperty.call(window.__PUBLIC_POOL_CONFIG__, key);
  }

  private normalizeBaseUrl(value: string | undefined): string {
    return (value ?? '').trim().replace(/\/+$/, '');
  }

  private resolveStratumUrl(value: string | undefined): string {
    const configured = (value ?? '').trim();
    if (configured.length > 0) {
      return configured;
    }

    if (typeof window === 'undefined') {
      return 'localhost:3333';
    }

    return `${window.location.hostname}:3333`;
  }

  private resolveSecureStratumUrl(value: string | undefined): string {
    const configured = (value ?? '').trim();
    if (configured.length > 0) {
      return configured;
    }

    if (typeof window === 'undefined') {
      return 'localhost:4333';
    }

    return `${window.location.hostname}:4333`;
  }

  private resolveOptionalUrl(value: string | undefined): string {
    return (value ?? '').trim();
  }
}
