/// <reference types="jasmine" />

import {KeystrokeTrackerService} from './keystroke-tracker.service';

describe('KeystrokeTrackerService', () => {
  it('should create the service', () => {
    const service = new KeystrokeTrackerService();
    expect(service).toBeTruthy();
  });
});
