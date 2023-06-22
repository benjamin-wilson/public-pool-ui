import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class WorkerService {

  constructor(
    private httpClient: HttpClient
  ) { }

  public getWorkerInfo(address: string, workerId: string): Observable<any> {
    return this.httpClient.get(`${environment.API_URL}/api/client/${address}/${workerId}`);
  }
}
