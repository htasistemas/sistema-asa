import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BackupLog {
  id: number;
  dataHora: string;
  tipo: string;
  arquivoNome?: string;
  tamanhoBytes?: number;
  status: string;
  mensagem?: string;
}

@Injectable({ providedIn: 'root' })
export class BackupService {
  private apiUrl = 'http://localhost:8080/api/backup';

  constructor(private http: HttpClient) {}

  baixarBackup(): Observable<Blob> {
    return this.http.get(this.apiUrl, { responseType: 'blob' });
  }

  restaurarBackup(arquivo: File): Observable<{ sucesso: boolean; mensagem: string }> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return this.http.post<{ sucesso: boolean; mensagem: string }>(`${this.apiUrl}/restore`, formData);
  }

  testarBackup(arquivo: File): Observable<{ sucesso: boolean; mensagem: string }> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return this.http.post<{ sucesso: boolean; mensagem: string }>(`${this.apiUrl}/testar`, formData);
  }

  listarLogs(): Observable<BackupLog[]> {
    return this.http.get<BackupLog[]>(`${this.apiUrl}/logs`);
  }
}
