import { TestBed } from '@angular/core/testing';

import { GlobalCountService } from './global-count.service';

describe('GlobalCountService', () => {
  let service: GlobalCountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalCountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
