import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppConfigService } from './app-config.service';


@Injectable({
  providedIn: 'root'
})
export class WorkerService {

  constructor(
    private httpClient: HttpClient,
    private appConfig: AppConfigService
  ) { }

  public getGroupWorkerInfo(address: string, workerName: string): Observable<any> {
    return this.httpClient.get(`${this.appConfig.apiUrl}/api/client/${address}/${workerName}`);
  }
  public getWorkerInfo(address: string, workerName: string, workerId: string): Observable<any> {
    return this.httpClient.get(`${this.appConfig.apiUrl}/api/client/${address}/${workerName}/${workerId}`);
  }
}
