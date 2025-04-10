import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../../core/config/endpoints';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface LoginResponse {
  data: {
    token: string;
  };
  status: number;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) { }

  isLoggedIn(): Observable<boolean> {
    const authToken = this.getToken();
    if (!authToken) {
      return of(false);
    }
    // console.log(authToken);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
    return this.http.get(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.AUTH.VALIDATE_TOKEN}`, { headers }).pipe(
      map(() => true),
      catchError((err) => {
        this.logout();
        return of(false);
      })
    );
  }

  login(credentials: {
    username: string;
    password: string;
  }): Observable<LoginResponse> {
    const formData = new FormData();
    formData.append('UserName', credentials.username);
    formData.append('Password', credentials.password);
    return this.http
      .post<LoginResponse>(
        `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`,
        formData
      )
      .pipe(
        map((response) => {
          // console.log(response);
          if (response.status === 200) {
            localStorage.setItem('auth_token', response.data.token);
          }
            return response;
        })
      );
  }

  logout() {
    localStorage.removeItem('auth_token');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

}
