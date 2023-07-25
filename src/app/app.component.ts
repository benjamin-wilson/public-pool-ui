import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { LocalStorageService } from './services/local-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'public-pool-ui';

  public particles$: Observable<boolean>;
  constructor(private localService: LocalStorageService) {
    this.particles$ = this.localService.particles$;
  }
}
