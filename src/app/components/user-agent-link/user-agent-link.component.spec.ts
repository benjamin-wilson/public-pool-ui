import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAgentLinkComponent } from './user-agent-link.component';

describe('UserAgentLinkComponent', () => {
  let component: UserAgentLinkComponent;
  let fixture: ComponentFixture<UserAgentLinkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserAgentLinkComponent]
    });
    fixture = TestBed.createComponent(UserAgentLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
