import { TestBed } from '@angular/core/testing';

import { KeystrokeTrackerService } from './keystroke-tracker.service';

describe('KeystrokeTrackerService', () => {
  let service: KeystrokeTrackerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeystrokeTrackerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
