import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {


  public clientInfo$: Observable<any>;

  constructor(private clientService: ClientService, private route: ActivatedRoute) {
    this.clientInfo$ = this.clientService.getClientInfo(this.route.snapshot.params['address']);



  }
}
