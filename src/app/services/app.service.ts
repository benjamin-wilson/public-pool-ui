import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  constructor(
    private httpClient: HttpClient,
    private envService: EnvService,
  ) { }

  public getInfo() {
    return this.httpClient.get(`${this.envService.apiUrl}/api/info`) as Observable<any>;
  }
  public getNetworkInfo() {
    return this.httpClient.get(`${this.envService.apiUrl}/api/network`) as Observable<any>;
  }
  public getInfoChart() {
    return this.httpClient.get(`${this.envService.apiUrl}/api/info/chart`) as Observable<any>;
  }
}
