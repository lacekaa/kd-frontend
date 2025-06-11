import { TestBed } from '@angular/core/testing';

import { ExperimentManagerService } from './experiment-manager.service';

describe('ExperimentManagerService', () => {
  let service: ExperimentManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExperimentManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
