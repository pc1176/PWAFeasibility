import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersistentDataDemoComponent } from './persistent-data-demo.component';

describe('PersistentDataDemoComponent', () => {
  let component: PersistentDataDemoComponent;
  let fixture: ComponentFixture<PersistentDataDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersistentDataDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersistentDataDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
