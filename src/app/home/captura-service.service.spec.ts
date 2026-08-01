import { TestBed } from '@angular/core/testing';

import { CapturaServiceService } from './captura-service.service';

describe('CapturaServiceService', () => {
  let service: CapturaServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CapturaServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
