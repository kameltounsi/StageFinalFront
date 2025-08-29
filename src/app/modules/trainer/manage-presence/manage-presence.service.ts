import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface SessionItem {
    id: number;
    date: string;          // yyyy-MM-dd
    heureDebut?: string;   // HH:mm
    heureFin?: string;     // HH:mm
    salle: string;
    matiere?: string;
    groupe: { id: number; nom: string; specialite: string };
}

export interface Student {
    id: number;
    fullName: string;
    email?: string;
}
// src/app/modules/trainer/manage-presence/manage-presence.service.ts
export interface Me {
    id: number;
    fullName: string;
    email: string;
    role: 'STUDENT' | 'TRAINER' | 'ADMIN';
}



export interface AttendanceMark {
    studentId: number;
    present: boolean;
}

@Injectable({ providedIn: 'root' })
export class ManagePresenceService {
    private base = 'http://localhost:8089';

    constructor(private http: HttpClient) {}

    me(): Observable<Me> {
        return this.http.get<Me>(`${this.base}/api/auth/me`);
    }
    /** séances hebdo du formateur */
    sessionsByTrainerAndWeek(trainerId: number, startISO: string, endISO: string): Observable<SessionItem[]> {
        return this.http.get<any[]>(
            `${this.base}/api/plannings/trainer/${trainerId}?startDate=${startISO}&endDate=${endISO}`
        ).pipe(
            map(list => (list || []).map(e => ({
                id: e.id,
                date: e.date,
                heureDebut: e.heureDebut ?? e.heure,
                heureFin: e.heureFin ?? '',
                salle: e.salle,
                matiere: e.matiere ?? e.groupe?.specialite ?? '',
                groupe: e.groupe
            } as SessionItem)))
        );
    }

    /** récupère les étudiants du groupe */
 /*   studentsByGroupe(groupeId: number): Observable<Student[]> {
        // suppose GET /api/groups/{id} -> { id, nom, students: [...] }
        return this.http.get<any>(`${this.base}/api/groups/${groupeId}`).pipe(
            map(g => (g?.students || []).map((s: any) => ({
                id: s.id, fullName: s.fullName, email: s.email
            } as Student)))
        );
    }
*/
    /** charge présence d’une séance */
    getAttendance(sessionId: number): Observable<AttendanceMark[]> {
        return this.http.get<AttendanceMark[]>(`${this.base}/api/attendance/session/${sessionId}`);
    }

    /** sauvegarde présence d’une séance (bulk) */
    saveAttendance(sessionId: number, marks: AttendanceMark[]): Observable<void> {
        return this.http.post<void>(`${this.base}/api/attendance/session/${sessionId}`, marks);
    }
    // private base = environment.apiBase;  // <-- utilise environment
    studentsByGroupe(groupeId: number): Observable<Student[]> {
        return this.http.get<any>(`${this.base}/api/groups/${groupeId}`).pipe(
            map(g => (g?.students || []).map((s: any) => {
                const full = s.fullName ?? [s.fullname, s.fname, s.lname].filter(Boolean).join(' ').trim();
                return { id: s.id, fullName: full, email: s.email } as Student;
            }))
        );
    }

}
