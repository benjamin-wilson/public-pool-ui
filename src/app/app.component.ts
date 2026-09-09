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
    // Applies the saved theme and text size before the layout renders, so a reader who
    // chose one last visit is not shown the default first.
    layoutService.init();
    this.particles$ = this.localService.particles$;
  }
}
