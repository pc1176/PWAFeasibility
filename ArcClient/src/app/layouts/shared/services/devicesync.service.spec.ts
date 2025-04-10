import { TestBed } from '@angular/core/testing';

import { DevicesyncService } from './devicesync.service';

describe('DevicesyncService', () => {
  let service: DevicesyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DevicesyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
