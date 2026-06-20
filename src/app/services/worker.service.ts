import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppConfigService } from './app-config.service';
import { PayoutMode } from './app.service';


@Injectable({
  providedIn: 'root'
})
export class WorkerService {

  constructor(
    private httpClient: HttpClient,
    private appConfig: AppConfigService
  ) { }

  public getGroupWorkerInfo(address: string, workerName: string, payoutMode?: PayoutMode | 'all'): Observable<any> {
    return this.httpClient.get(`${this.appConfig.apiUrl}/api/client/${address}/${workerName}${this.toPayoutModeQuery(payoutMode)}`);
  }
  public getWorkerInfo(address: string, workerName: string, workerId: string, payoutMode?: PayoutMode | 'all'): Observable<any> {
    return this.httpClient.get(`${this.appConfig.apiUrl}/api/client/${address}/${workerName}/${workerId}${this.toPayoutModeQuery(payoutMode)}`);
  }

  private toPayoutModeQuery(payoutMode?: PayoutMode | 'all'): string {
    return payoutMode == null ? '' : `?payoutMode=${encodeURIComponent(payoutMode)}`;
  }
}
