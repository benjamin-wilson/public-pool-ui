import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppConfigService } from './app-config.service';

export type PayoutMode = 'solo' | 'pplns';

@Injectable({
    providedIn: 'root'
})
export class AppService {

    constructor(
        private httpClient: HttpClient,
        private appConfig: AppConfigService
    ) { }

    public getInfo() {
        return this.httpClient.get(`${this.appConfig.apiUrl}/api/info`) as Observable<any>;
    }
    public getNetworkInfo() {
        return this.httpClient.get(`${this.appConfig.apiUrl}/api/network`) as Observable<any>;
    }
    public getInfoChart() {
        return this.httpClient.get(`${this.appConfig.apiUrl}/api/info/chart`) as Observable<any>;
    }
    public getInfoChartByPayoutMode(payoutMode?: PayoutMode | 'all') {
        return this.httpClient.get(`${this.appConfig.apiUrl}/api/info/chart/payout-modes${this.toPayoutModeQuery(payoutMode)}`) as Observable<any[]>;
    }
    public getAccounting(payoutMode?: PayoutMode | 'all') {
        return this.httpClient.get(`${this.appConfig.apiUrl}/api/info/accounting${this.toPayoutModeQuery(payoutMode)}`) as Observable<any>;
    }

    private toPayoutModeQuery(payoutMode?: PayoutMode | 'all'): string {
        return payoutMode == null ? '' : `?payoutMode=${encodeURIComponent(payoutMode)}`;
    }
}
