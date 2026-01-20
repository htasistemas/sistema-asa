import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Assignment {
  id?: number;
  campaignId: number;
  unitId: number;
  date: string;
  location: string;
  startTime: string;
  endTime: string;
}

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private apiUrl = 'http://localhost:8080/api/assignments';

  constructor(private http: HttpClient) {}

  list(): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(this.apiUrl);
  }

  create(assignment: Assignment): Observable<Assignment> {
    return this.http.post<Assignment>(this.apiUrl, assignment);
  }

  update(assignment: Assignment): Observable<Assignment> {
    return this.http.put<Assignment>(`${this.apiUrl}/${assignment.id}`, assignment);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}