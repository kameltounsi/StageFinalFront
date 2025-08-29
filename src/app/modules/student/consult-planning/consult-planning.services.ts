// app/modules/student/consult-planning/consult-planning.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Aligning with your WeeklyItem shape used by trainer
// app/modules/student/consult-planning/consult-planning.service.ts
export interface WeeklyItem {
    id: number;
    date: string;        // 'YYYY-MM-DD'
    heureDebut: string;  // 'HH:mm' or 'HH:mm:ss' (both OK for string compare)
    heureFin: string;
    matiere: string;
    salle: string;
    formateurNom?: string;    // NEW
    formateurId?: number;     // optional
}



@Injectable({ providedIn: 'root' })
export class ConsultPlanningService {
    private readonly baseUrl = '/api';

    constructor(private http: HttpClient) {}

    /** Student's weekly schedule (authenticated user) */
    getMyWeek(start: string, end: string): Observable<WeeklyItem[]> {
        return this.http.get<WeeklyItem[]>(
            `${this.baseUrl}/studentsSchedule/me/weekly-schedule`,
            { params: { start, end } }
        );
    }

    /** Optional: group schedule (for admin views) */
    getGroupWeek(groupId: number, start: string, end: string): Observable<WeeklyItem[]> {
        return this.http.get<WeeklyItem[]>(
            `${this.baseUrl}/studentsSchedule/${groupId}/weekly-schedule`,
            { params: { start, end } }
        );
    }

    /** PDF export (by range) */
    downloadMyWeekPdf(start: string, end: string) {
        return this.http.get(
            `${this.baseUrl}/studentsschedule/me/weekly-schedule.pdf`,
            { params: { start, end }, responseType: 'blob' as 'json' }
        );
    }
}
