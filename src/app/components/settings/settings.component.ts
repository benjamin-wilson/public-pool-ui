import { Component } from '@angular/core';

import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

  public stateOptions: any[] = [{ label: 'On', value: true }, { label: 'Off', value: false },];

  public value: boolean = true;

  constructor(private localStorageService: LocalStorageService) {
    this.value = this.localStorageService.getParticles();
  }

  public particlesChanged(newVal: boolean) {
    this.localStorageService.setParticles(newVal);
    this.value = newVal;
  }
}
