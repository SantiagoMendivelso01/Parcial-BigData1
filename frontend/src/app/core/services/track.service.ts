import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Track, Genre } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class TrackService {
  constructor(private http: HttpClient) {}

  search(q?: string, genre?: string) {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    if (genre) params = params.set('genre', genre);
    return this.http.get<Track[]>(`${environment.apiUrl}/api/tracks/search`, { params });
  }

  getGenres() {
    return this.http.get<Genre[]>(`${environment.apiUrl}/api/tracks/genres`);
  }
}
