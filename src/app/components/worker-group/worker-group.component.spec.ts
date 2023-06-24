import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerGroupComponent } from './worker-group.component';

describe('WorkerGroupComponent', () => {
  let component: WorkerGroupComponent;
  let fixture: ComponentFixture<WorkerGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerGroupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkerGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
