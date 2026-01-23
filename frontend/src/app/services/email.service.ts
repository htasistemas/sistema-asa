import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface EmailEnvio {
  assunto: string;
  mensagem: string;
  cidade?: string;
  regiao?: string;
  distrito?: string;
}

export interface EmailLog {
  id?: number;
  assunto: string;
  mensagem: string;
  cidade?: string;
  regiao?: string;
  distrito?: string;
  quantidadeEnvios: number;
  dataHora: string;
}

@Injectable({ providedIn: 'root' })
export class EmailService {
  private apiUrl = 'http://localhost:8080/api/email';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  enviarParaUnidades(envio: EmailEnvio): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/unidades`, envio, this.obterOpcoesAutorizacao());
  }

  listarLogs(): Observable<EmailLog[]> {
    return this.http.get<EmailLog[]>(`${this.apiUrl}/logs`, this.obterOpcoesAutorizacao());
  }

  private obterOpcoesAutorizacao(): { headers?: HttpHeaders } {
    const token = this.authService.getToken();
    if (!token) {
      return {};
    }
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }
}
