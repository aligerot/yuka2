import { TestBed } from '@angular/core/testing';

import { OpenFoodFactService } from './open-food-fact-service.service';

describe('OpenFoodFactServiceService', () => {
  let service: OpenFoodFactService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenFoodFactService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
