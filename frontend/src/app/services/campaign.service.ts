import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Campaign {
  id?: number;
  name: string;
  baseAddress?: string;
  startDate?: string;
  endDate?: string;
  locations: string[];
}

@Injectable({ providedIn: 'root' })
export class CampaignService {
  private apiUrl = 'http://localhost:8080/api/campaigns';

  constructor(private http: HttpClient) {}

  list(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(this.apiUrl);
  }

  create(campaign: Campaign): Observable<Campaign> {
    return this.http.post<Campaign>(this.apiUrl, campaign);
  }

  update(campaign: Campaign): Observable<Campaign> {
    return this.http.put<Campaign>(`${this.apiUrl}/${campaign.id}`, campaign);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}