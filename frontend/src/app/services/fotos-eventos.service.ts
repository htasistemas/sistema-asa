import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface FotoEventoInstituicao {
  id?: number;
  nomeInstituicao: string;
  nomeEvento: string;
  dataEvento?: string;
  urlFoto: string;
  descricao?: string;
}

@Injectable({ providedIn: 'root' })
export class FotosEventosService {
  private apiUrl = 'http://localhost:8080/api/fotos-eventos';

  constructor(private http: HttpClient, private authService: AuthService) {}

  listar(): Observable<FotoEventoInstituicao[]> {
    return this.http.get<FotoEventoInstituicao[]>(this.apiUrl, this.obterOpcoesAutorizacao());
  }

  criar(foto: FotoEventoInstituicao): Observable<FotoEventoInstituicao> {
    return this.http.post<FotoEventoInstituicao>(this.apiUrl, foto, this.obterOpcoesAutorizacao());
  }

  atualizar(foto: FotoEventoInstituicao): Observable<FotoEventoInstituicao> {
    return this.http.put<FotoEventoInstituicao>(`${this.apiUrl}/${foto.id}`, foto, this.obterOpcoesAutorizacao());
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
