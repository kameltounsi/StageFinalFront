import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {catchError, from, map, Observable, switchMap, throwError} from 'rxjs';

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
    downloadPdf(groupeId: number, start: string, end: string) {
        return this.http.get(`${this.apiUrl}/groupe/${groupeId}/pdf`, {
            params: { start, end },
            responseType: 'blob'
        });
    }
    /*
    exportPdf(
        groupeId: number,
        startDate: string,
        endDate: string
    ): Observable<{ blob: Blob; filename: string }> {
        const url = `${this.apiUrl}/groupe/${groupeId}/pdf`;
        const token = localStorage.getItem('access_token');

        return this.http.get(url, {
            responseType: 'blob',
            observe: 'response',
            params: { startDate, endDate },
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }).pipe(
            map((res: HttpResponse<Blob>) => {
                const disp = res.headers.get('Content-Disposition') || '';
                let filename = 'planning.pdf';
                const m = disp.match(/filename="(.+?)"/i);
                if (m) filename = m[1];
                return { blob: res.body as Blob, filename };
            })
        );
    }
*/
    exportPdf(
        groupeId: number,
        startDate: string,
        endDate: string
    ): Observable<{ blob: Blob; filename: string }> {
        const url = `${this.apiUrl}/groupe/${groupeId}/pdf`;
        const token = localStorage.getItem('access_token');

        return this.http.get(url, {
            responseType: 'blob',
            observe: 'response',
            params: { startDate, endDate },
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }).pipe(
            map((res: HttpResponse<Blob>) => {
                const disp = res.headers.get('Content-Disposition') || '';

                // 1) Tente filename*=UTF-8''
                const star = disp.match(/filename\*\s*=\s*(?:UTF-8''|)([^;]+)/i);
                if (star && star[1]) {
                    try {
                        const decoded = decodeURIComponent(star[1].replace(/^"+|"+$/g, ''));
                        return { blob: res.body as Blob, filename: decoded };
                    } catch {
                        // ignore et tente filename=
                    }
                }

                // 2) Sinon fallback sur filename="..."
                let filename = 'planning.pdf';
                const m = disp.match(/filename="([^"]+)"/i) || disp.match(/filename=([^;]+)/i);
                if (m && m[1]) {
                    filename = m[1].replace(/^"+|"+$/g, '');
                }
                return { blob: res.body as Blob, filename };
            })
        );
    }

}
