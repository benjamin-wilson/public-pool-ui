import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(
    private httpClient: HttpClient
  ) { }

  public getClientInfo(address: string) {
    return this.httpClient.get(`${environment.API_URL}/api/client/${address}`);
  }
}
