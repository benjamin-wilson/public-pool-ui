import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

import { bitcoinAddressValidator } from '../../validators/bitcoin-address.validator';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent {

  public address: FormControl;
  constructor() {
    this.address = new FormControl(null, bitcoinAddressValidator());
  }
}
