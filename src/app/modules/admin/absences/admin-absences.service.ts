// src/app/modules/admin/absences/admin-absences.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Group {
    id: number;
    nom: string;
    specialite: string;
}

export interface SummaryRow {
    studentId: number;
    studentName: string;
    studentEmail: string;
    groupId: number;
    groupName: string;
    specialite: string;
    totalAbsences: number;
    unjustifiedAbsences: number;
}

export interface DetailItem {
    presenceId: number;
    date: string;
    start: string;
    end: string;
    matiere: string;
    room?: string;
    statut: 'PRESENT'|'ABSENT'|'RETARD';
}

@Injectable({ providedIn: 'root' })
export class AdminAbsencesService {
    private base = 'http://localhost:8089/api/admin/absences';
    constructor(private http: HttpClient) {}

    specialites(): Observable<string[]> {
        return this.http.get<string[]>(`${this.base}/specialites`);
    }

    groups(specialite: string): Observable<Group[]> {
        return this.http.get<Group[]>(`${this.base}/groups`, { params: { specialite } });
    }

    summary(params: {
        specialite?: string; groupId?: number;
        start?: string; end?: string;
        sortBy?: 'total'|'unjustified'|'name'; dir?: 'asc'|'desc';
    }): Observable<SummaryRow[]> {
        let hp = new HttpParams();
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && `${v}` !== '') hp = hp.set(k, `${v}`);
        });
        return this.http.get<SummaryRow[]>(`${this.base}/summary`, { params: hp });
    }

    details(studentId: number, params: {
        specialite?: string; groupId?: number; start?: string; end?: string;
    }): Observable<DetailItem[]> {
        let hp = new HttpParams();
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && `${v}` !== '') hp = hp.set(k, `${v}`);
        });
        return this.http.get<DetailItem[]>(
            `${this.base}/students/${studentId}/details`,
            { params: hp }
        );
    }

    /** NEW: alerte un étudiant précis */
    sendAlert(studentId: number, minUnjustified = 5): Observable<void> {
        return this.http.post<void>(`${this.base}/alerts/send`, { studentId, minUnjustified });
    }

    /** NEW: alerte en lot selon les filtres en cours */
    sendBulkAlert(params: {
        specialite?: string; groupId?: number;
        start?: string; end?: string;
        minUnjustified?: number;
    }): Observable<{ sent: number }> {
        const body = {
            specialite: params.specialite ?? null,
            groupId: params.groupId ?? null,
            start: params.start ?? null,
            end: params.end ?? null,
            minUnjustified: params.minUnjustified ?? 5
        };
        return this.http.post<{ sent: number }>(`${this.base}/alerts/send-bulk`, body);
    }
}
