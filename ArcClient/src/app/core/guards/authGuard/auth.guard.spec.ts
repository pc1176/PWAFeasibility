import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';

describe('authGuard', () => {
  let authGuard: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    authGuard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(authGuard).toBeTruthy();
  });
});