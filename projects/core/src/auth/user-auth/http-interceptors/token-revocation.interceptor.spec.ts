import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { of, Subscription } from 'rxjs';
import { AuthStorageService } from '../facade/auth-storage.service';
import { AuthToken } from '../models/auth-token.model';
import { AuthConfigService } from '../services/auth-config.service';
import { TokenRevocationInterceptor } from './token-revocation.interceptor';

class MockAuthStorageService implements Partial<AuthStorageService> {
  getToken() {
    return of({
      token_type: 'Bearer',
      access_token: 'acc_token',
    } as AuthToken);
  }
}

class MockAuthConfigService implements Partial<AuthConfigService> {
  getRevokeEndpoint() {
    return '/revoke';
  }
}

describe('TokenRevocationInterceptor', () => {
  let httpMock: HttpTestingController;
  let tokenRevocationInterceptor: TokenRevocationInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: TokenRevocationInterceptor,
          multi: true,
        },
        {
          provide: AuthConfigService,
          useClass: MockAuthConfigService,
        },
        {
          provide: AuthStorageService,
          useClass: MockAuthStorageService,
        },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    tokenRevocationInterceptor = TestBed.inject(TokenRevocationInterceptor);
  });

  it('should be created', () => {
    expect(tokenRevocationInterceptor).toBeTruthy();
  });

  it(`Should not add 'Authorization' header for non revoke requests`, inject(
    [HttpClient],
    (http: HttpClient) => {
      const sub: Subscription = http.get('/xxx').subscribe((result) => {
        expect(result).toBeTruthy();
      });

      const mockReq: TestRequest = httpMock.expectOne((req) => {
        return req.method === 'GET';
      });

      const authHeader: string = mockReq.request.headers.get('Authorization');
      expect(authHeader).toBeFalsy();
      expect(authHeader).toEqual(null);

      mockReq.flush('someData');
      sub.unsubscribe();
    }
  ));

  it(`Should add 'Authorization' header for revoke request`, inject(
    [HttpClient],
    (http: HttpClient) => {
      const sub: Subscription = http.get('/revoke').subscribe((result) => {
        expect(result).toBeTruthy();
      });

      const mockReq: TestRequest = httpMock.expectOne((req) => {
        return req.method === 'GET';
      });

      const authHeader: string = mockReq.request.headers.get('Authorization');
      expect(authHeader).toBeTruthy();
      expect(authHeader).toEqual(`Bearer acc_token`);

      mockReq.flush('someData');
      sub.unsubscribe();
    }
  ));
});