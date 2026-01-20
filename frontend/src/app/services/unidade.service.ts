import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Unidade {
  id?: number;
  nomeUnidade: string;
  diretor?: string;
  telefone?: string;
  bairro?: string;
  cidade?: string;
  regiao?: string;
  distrito?: string;
  emailUnidade?: string;
  enderecoCompleto?: string;
  anoEleicao?: number;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

@Injectable({ providedIn: 'root' })
export class UnidadeService {
  private apiUrl = 'http://localhost:8080/api/units';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  listar(): Observable<Unidade[]> {
    return this.http.get<Unidade[]>(this.apiUrl, this.obterOpcoesAutorizacao());
  }

  buscarPorId(id: number): Observable<Unidade> {
    return this.http.get<Unidade>(`${this.apiUrl}/${id}`, this.obterOpcoesAutorizacao());
  }

  criar(unidade: Unidade): Observable<Unidade> {
    return this.http.post<Unidade>(this.apiUrl, unidade, this.obterOpcoesAutorizacao());
  }

  atualizar(unidade: Unidade): Observable<Unidade> {
    return this.http.put<Unidade>(`${this.apiUrl}/${unidade.id}`, unidade, this.obterOpcoesAutorizacao());
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
