import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(
    private httpClient: HttpClient,
    private appConfig: AppConfigService
  ) { }

  public getClientInfo(address: string) {
    return this.httpClient.get(`${this.appConfig.apiUrl}/api/client/${address}`);
  }
  public getClientInfoChart(address: string) {
    return this.httpClient.get(`${this.appConfig.apiUrl}/api/client/${address}/chart`) as Observable<any[]>;
  }
}
