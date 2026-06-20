import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppConfigService } from './app-config.service';
import { PayoutMode } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(
    private httpClient: HttpClient,
    private appConfig: AppConfigService
  ) { }

  public getClientInfo(address: string, payoutMode?: PayoutMode | 'all'): Observable<any> {
    return this.httpClient.get(`${this.appConfig.apiUrl}/api/client/${address}${this.toPayoutModeQuery(payoutMode)}`) as Observable<any>;
  }
  public getClientInfoChart(address: string) {
    return this.httpClient.get(`${this.appConfig.apiUrl}/api/client/${address}/chart`) as Observable<any[]>;
  }
  public getClientInfoChartByPayoutMode(address: string, payoutMode?: PayoutMode | 'all') {
    return this.httpClient.get(`${this.appConfig.apiUrl}/api/client/${address}/chart/payout-modes${this.toPayoutModeQuery(payoutMode)}`) as Observable<any[]>;
  }

  private toPayoutModeQuery(payoutMode?: PayoutMode | 'all'): string {
    return payoutMode == null ? '' : `?payoutMode=${encodeURIComponent(payoutMode)}`;
  }
}
