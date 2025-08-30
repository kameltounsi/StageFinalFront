import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface SessionItem {
    id: number;
    date: string;
    heureDebut?: string;
    heureFin?: string;
    salle: string;
    matiere?: string;
    groupe: { id: number; nom: string; specialite: string };
}

export interface Student {
    id: number;
    fullName: string;
    email?: string;
}

export interface Me {
    id: number;
    fullName: string;
    email: string;
    role: 'STUDENT' | 'TRAINER' | 'ADMIN';
}

export interface AttendanceMark {
    studentId: number;
    present: boolean;
    justified?: boolean;          // NEW
    justificationNote?: string;   // NEW
}

interface RosterViewDTO {
    emploiId: number;
    date: string;
    start: string;
    end: string;
    groupeId: number;
    groupeNom: string;
    matiere: string;
    rows: Array<{
        studentId: number;
        fullName: string;
        email?: string;
        current: 'PRESENT' | 'ABSENT' | 'RETARD' | null;
        justified?: boolean;            // NEW (backend RosterRowDTO)
        justificationNote?: string;     // NEW (backend RosterRowDTO)
    }>;
}

@Injectable({ providedIn: 'root' })
export class ManagePresenceService {
    private base = 'http://localhost:8089';

    constructor(private http: HttpClient) {}

    me(): Observable<Me> {
        return this.http.get<Me>(`${this.base}/api/auth/me`);
    }

    sessionsByTrainerAndWeek(_trainerId: number, _startISO: string, _endISO: string): Observable<SessionItem[]> {
        return this.http
            .get<any[]>(`${this.base}/api/trainers/me/attendance/today-seances`)
            .pipe(
                map(list => (list || []).map(e => ({
                    id: e.id,
                    date: e.date,
                    heureDebut: e.start ?? e.heureDebut,
                    heureFin: e.end ?? e.heureFin,
                    salle: e.salle,
                    matiere: e.matiere,
                    groupe: { id: e.groupeId, nom: e.groupeNom, specialite: e.matiere }
                } as SessionItem)))
            );
    }

    getRoster(sessionId: number): Observable<{ students: Student[]; marks: AttendanceMark[] }> {
        return this.http
            .get<RosterViewDTO>(`${this.base}/api/trainers/me/attendance/sessions/${sessionId}/roster`)
            .pipe(map(this.rosterToUi));
    }

    historySessions(startISO: string, endISO: string): Observable<SessionItem[]> {
        return this.http
            .get<any[]>(`${this.base}/api/trainers/me/attendance/history-sessions`, {
                params: { start: startISO, end: endISO }
            })
            .pipe(
                map(list => (list || []).map(e => ({
                    id: e.id,
                    date: e.date,
                    heureDebut: e.start ?? e.heureDebut,
                    heureFin: e.end ?? e.heureFin,
                    salle: e.salle,
                    matiere: e.matiere,
                    groupe: { id: e.groupeId, nom: e.groupeNom, specialite: e.matiere }
                } as SessionItem)))
            );
    }

    getHistoryRoster(sessionId: number): Observable<{ students: Student[]; marks: AttendanceMark[] }> {
        return this.http
            .get<RosterViewDTO>(`${this.base}/api/trainers/me/attendance/history-sessions/${sessionId}/roster`)
            .pipe(map(this.rosterToUi));
    }

    /** Envoi PRESENT/ABSENT + justification quand ABSENT */
    saveAttendance(sessionId: number, marks: AttendanceMark[]): Observable<void> {
        const payload = marks.map(m => ({
            studentId: m.studentId,
            statut: m.present ? 'PRESENT' : 'ABSENT',
            justified: !m.present ? !!m.justified : false,
            justificationNote: !m.present ? (m.justificationNote || null) : null
        }));
        return this.http.post<void>(`${this.base}/api/trainers/me/attendance/sessions/${sessionId}/mark`, payload);
    }

    saveHistoryAttendance(sessionId: number, marks: AttendanceMark[]): Observable<void> {
        const payload = marks.map(m => ({
            studentId: m.studentId,
            statut: m.present ? 'PRESENT' : 'ABSENT',
            justified: !m.present ? !!m.justified : false,
            justificationNote: !m.present ? (m.justificationNote || null) : null
        }));
        return this.http.post<void>(`${this.base}/api/trainers/me/attendance/history-sessions/${sessionId}/mark`, payload);
    }

    // ---- helpers
    private rosterToUi = (r: RosterViewDTO) => {
        const students: Student[] = r.rows.map(row => ({
            id: row.studentId,
            fullName: row.fullName,
            email: row.email
        }));
        const marks: AttendanceMark[] = r.rows.map(row => ({
            studentId: row.studentId,
            present: row.current === 'PRESENT',
            justified: row.justified,
            justificationNote: row.justificationNote
        }));
        return { students, marks };
    };
}
