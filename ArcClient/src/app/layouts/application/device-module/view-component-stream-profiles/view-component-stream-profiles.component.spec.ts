import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewComponentStreamProfilesComponent } from './view-component-stream-profiles.component';

describe('ViewComponentStreamProfilesComponent', () => {
  let component: ViewComponentStreamProfilesComponent;
  let fixture: ComponentFixture<ViewComponentStreamProfilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewComponentStreamProfilesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewComponentStreamProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
