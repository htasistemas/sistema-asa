import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FileResource {
  id?: number;
  name: string;
  category: string;
  url: string;
  date?: string;
}

@Injectable({ providedIn: 'root' })
export class FileService {
  private apiUrl = 'http://localhost:8080/api/files';

  constructor(private http: HttpClient) {}

  list(): Observable<FileResource[]> {
    return this.http.get<FileResource[]>(this.apiUrl);
  }

  create(file: FileResource): Observable<FileResource> {
    return this.http.post<FileResource>(this.apiUrl, file);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}