import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

interface RuntimeConfig {
  API_URL?: string;
  STRATUM_URL?: string;
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
}
