import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpHeaders } from '@angular/common/http';

export interface PontuacaoUnidade {
  nomeUnidade: string;
  periodoRelatorio: string;
  pontosTotal: number;
  seloExcelencia: boolean;
  trofeuMelhorUnidadeAno: boolean;
}

export interface PontuacaoAtividadeConfig {
  chave: string;
  descricao: string;
  pontos: number;
}

@Injectable({ providedIn: 'root' })
export class PontuacaoUnidadesService {
  private apiUrl = 'http://localhost:8080/api/pontuacao-unidades';

  constructor(private http: HttpClient, private authService: AuthService) {}

  listarPontuacoes(periodo: string): Observable<PontuacaoUnidade[]> {
    return this.http.get<PontuacaoUnidade[]>(`${this.apiUrl}?periodo=${encodeURIComponent(periodo)}`, this.obterOpcoesAutorizacao());
  }

  listarConfiguracoes(): Observable<PontuacaoAtividadeConfig[]> {
    return this.http.get<PontuacaoAtividadeConfig[]>(`${this.apiUrl}/configuracoes`, this.obterOpcoesAutorizacao());
  }

  salvarConfiguracoes(configuracoes: PontuacaoAtividadeConfig[]): Observable<PontuacaoAtividadeConfig[]> {
    return this.http.put<PontuacaoAtividadeConfig[]>(`${this.apiUrl}/configuracoes`, configuracoes, this.obterOpcoesAutorizacao());
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
