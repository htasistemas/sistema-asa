import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Report {
  id?: number;
  unitId: number;
  type: string;
  beneficiaries: number;
  items?: number;
  date: string;
  description: string;
  value?: number;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = 'http://localhost:8080/api/reports';

  constructor(private http: HttpClient) {}

  list(): Observable<Report[]> {
    return this.http.get<Report[]>(this.apiUrl);
  }

  create(report: Report): Observable<Report> {
    return this.http.post<Report>(this.apiUrl, report);
  }

  update(report: Report): Observable<Report> {
    return this.http.put<Report>(`${this.apiUrl}/${report.id}`, report);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}