import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface AuthResponse {
  token: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token: string | null = null;
  private role: string | null = null;
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(res => {
        this.token = res.token;
        this.role = res.role;
        localStorage.setItem('asaToken', res.token);
        localStorage.setItem('asaRole', res.role);
      })
    );
  }

  register(username: string, password: string, role = 'ADMIN'): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/register`, { username, password, role });
  }

  logout(): void {
    this.token = null;
    this.role = null;
    localStorage.removeItem('asaToken');
    localStorage.removeItem('asaRole');
  }

  isAuthenticated(): boolean {
    if (!this.token) {
      this.token = localStorage.getItem('asaToken');
      this.role = localStorage.getItem('asaRole');
    }
    return !!this.token;
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('asaToken');
    }
    return this.token;
  }

  getRole(): string | null {
    if (!this.role) {
      this.role = localStorage.getItem('asaRole');
    }
    return this.role;
  }
}
