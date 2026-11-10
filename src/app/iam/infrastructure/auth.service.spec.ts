import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { initials } from '../domain/model/user.entity';
import { AuthService } from './auth.service';

const SIGN_IN_URL = `${environment.apiBaseUrl}/authentication/sign-in`;

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('signs in and keeps the user for the session', () => {
    service.signIn({ email: ' Lucia.Medina@RetailCo.pe ', password: 'demo1234' }, false).subscribe();

    const req = http.expectOne(SIGN_IN_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.email).toBe('lucia.medina@retailco.pe');
    req.flush({ id: 1, email: 'lucia.medina@retailco.pe', fullName: 'Lucía Medina', role: 'ADMIN', jobTitle: 'Floor supervisor', storeId: 1, token: 't' });

    expect(service.isSignedIn()).toBe(true);
    expect(sessionStorage.getItem('ic-console-session')).toContain('Lucía Medina');
  });

  it('stays signed out when the credentials are wrong', () => {
    service.signIn({ email: 'x@y.pe', password: 'wrong1' }, true).subscribe({ error: () => undefined });
    http.expectOne(SIGN_IN_URL).flush({ message: 'Invalid' }, { status: 401, statusText: 'Unauthorized' });

    expect(service.isSignedIn()).toBe(false);
  });

  it('rejects shopper accounts, which use the mobile app', () => {
    let status = 0;
    service.signIn({ email: 'camila.rios@gmail.com', password: 'demo1234' }, false).subscribe({ error: (e) => (status = e.status) });
    http.expectOne(SIGN_IN_URL).flush({ id: 2, email: 'camila.rios@gmail.com', fullName: 'Camila Ríos', role: 'SHOPPER', storeId: 1, token: 't' });

    expect(status).toBe(403);
    expect(service.isSignedIn()).toBe(false);
  });

  it('builds the avatar initials from the full name', () => {
    expect(initials('Lucía Medina')).toBe('LM');
  });
});
