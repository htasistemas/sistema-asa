import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UnitLife {
  unitId: number;
  goalsJson: string;
  pendenciesJson: string;
}

@Injectable({ providedIn: 'root' })
export class UnitLifeService {
  private apiUrl = 'http://localhost:8080/api/unit-life';

  constructor(private http: HttpClient) {}

  getByUnit(unitId: number): Observable<UnitLife> {
    return this.http.get<UnitLife>(`${this.apiUrl}/${unitId}`);
  }

  upsert(payload: UnitLife): Observable<UnitLife> {
    return this.http.post<UnitLife>(this.apiUrl, payload);
  }
}