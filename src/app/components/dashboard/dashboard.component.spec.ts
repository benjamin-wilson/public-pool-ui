import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent, maxBestDifficulty } from './dashboard.component';

describe('maxBestDifficulty', () => {

  it('compares numerically when the API sends difficulty as strings', () => {
    // The reported case. Under a lexicographic comparison "80" ranks above "272",
    // because "8" sorts above "2".
    const workers = [
      { name: 'a', bestDifficulty: '272' },
      { name: 'b', bestDifficulty: '80' },
    ];

    expect(maxBestDifficulty(workers)).toBe(272);
  });

  it('handles the magnitudes the API actually returns', () => {
    const workers = [
      { name: 'a', bestDifficulty: '294141974944674.8' },
      { name: 'b', bestDifficulty: '1458091887788.7488' },
    ];

    expect(maxBestDifficulty(workers)).toBe(294141974944674.8);
  });

  it('still compares numerically when difficulty arrives as numbers', () => {
    const workers = [
      { name: 'a', bestDifficulty: 272 },
      { name: 'b', bestDifficulty: 80 },
    ];

    expect(maxBestDifficulty(workers)).toBe(272);
  });

  it('skips workers whose difficulty is missing or unparseable', () => {
    const workers = [
      { name: 'a', bestDifficulty: '100' },
      { name: 'b' },
      { name: 'c', bestDifficulty: null },
      { name: 'd', bestDifficulty: 'not a number' },
    ];

    expect(maxBestDifficulty(workers)).toBe(100);
  });

  it('is zero when there are no workers', () => {
    expect(maxBestDifficulty([])).toBe(0);
  });
});

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
