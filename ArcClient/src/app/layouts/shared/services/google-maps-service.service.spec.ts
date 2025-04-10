import { TestBed } from '@angular/core/testing';

import { GoogleMapsServiceService } from './google-maps-service.service';

describe('GoogleMapsServiceService', () => {
  let service: GoogleMapsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleMapsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
