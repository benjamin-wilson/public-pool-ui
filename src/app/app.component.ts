import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { LayoutService } from './layout/service/app.layout.service';
import { LocalStorageService } from './services/local-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'public-pool-ui';

  public particles$: Observable<boolean>;
  constructor(private localService: LocalStorageService, layoutService: LayoutService) {
    // Apply the saved appearance before the layout renders.
    layoutService.init();
    this.particles$ = this.localService.particles$;
  }
}
