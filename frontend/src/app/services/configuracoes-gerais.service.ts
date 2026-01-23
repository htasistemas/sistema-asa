import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface ConfiguracaoGeral {
  id?: number;
  versao: string;
  dataHora: string;
  mudancas: string;
}

@Injectable({ providedIn: 'root' })
export class ConfiguracoesGeraisService {
  private apiUrl = 'http://localhost:8080/api/configuracoes-gerais';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  listar(): Observable<ConfiguracaoGeral[]> {
    return this.http.get<ConfiguracaoGeral[]>(this.apiUrl, this.obterOpcoesAutorizacao());
  }

  criar(configuracao: ConfiguracaoGeral): Observable<ConfiguracaoGeral> {
    return this.http.post<ConfiguracaoGeral>(this.apiUrl, configuracao, this.obterOpcoesAutorizacao());
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.obterOpcoesAutorizacao());
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
