import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmploiTempsPayload {
    date: string;           // 'YYYY-MM-DD'
    heureDebut: string;     // 'HH:mm'
    heureFin: string;       // 'HH:mm'
    salle: string;
    matiere: string;
    formateur: { id: number };
}

@Injectable({ providedIn: 'root' })
export class EmploiTempsService {
    private apiUrl = 'http://localhost:8089/api/plannings';

    constructor(private http: HttpClient) {}

    getByGroupe(groupeId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/groupe/${groupeId}`);
    }

    add(groupeId: number, payload: EmploiTempsPayload): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${groupeId}/add`, payload);
    }

// emploi-temps.service.ts
delete(emploiId: number): Observable<HttpResponse<string>> {
    return this.http.delete(`${this.apiUrl}/${emploiId}/delete`, {
        observe: 'response',      // <- on récupère le status code
        responseType: 'text'      // <- pas de parsing JSON
    });
}
}
