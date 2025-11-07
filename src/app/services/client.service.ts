import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(
    private httpClient: HttpClient,
    private envService: EnvService,
  ) { }

  public getClientInfo(address: string) {
    return this.httpClient.get(`${this.envService.apiUrl}/api/client/${address}`);
  }
  public getClientInfoChart(address: string) {
    return this.httpClient.get(`${this.envService.apiUrl}/api/client/${address}/chart`) as Observable<any[]>;
  }
}
