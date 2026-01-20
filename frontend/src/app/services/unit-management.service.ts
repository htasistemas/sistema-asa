import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UnitManagement {
  unitId: number;
  assetsJson: string;
  projectsJson: string;
}

@Injectable({ providedIn: 'root' })
export class UnitManagementService {
  private apiUrl = 'http://localhost:8080/api/unit-management';

  constructor(private http: HttpClient) {}

  getByUnit(unitId: number): Observable<UnitManagement> {
    return this.http.get<UnitManagement>(`${this.apiUrl}/${unitId}`);
  }

  upsert(payload: UnitManagement): Observable<UnitManagement> {
    return this.http.post<UnitManagement>(this.apiUrl, payload);
  }
}