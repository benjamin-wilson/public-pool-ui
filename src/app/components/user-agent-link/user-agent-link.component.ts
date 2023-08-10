import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-user-agent-link',
  templateUrl: './user-agent-link.component.html',
  styleUrls: ['./user-agent-link.component.scss']
})
export class UserAgentLinkComponent {

  @Input('userAgent') userAgent!: string;

  constructor() {

  }

  public cancelClick(event: Event) {
    event.stopImmediatePropagation();
  }
}
