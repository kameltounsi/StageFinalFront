// src/app/modules/trainer/manage-presence/manage-presence.service.ts
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

export interface Me {
    id: number;
    fullName: string;
    email: string;
    role: 'STUDENT' | 'TRAINER' | 'ADMIN';
}

export interface AttendanceMark {
    studentId: number;
    present: boolean; // mapping vers statut backend
}

/** Réponse backend du roster */
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
        current: 'PRESENT' | 'ABSENT' | 'RETARD' | null;
    }>;
}

@Injectable({ providedIn: 'root' })
export class ManagePresenceService {
    private base = 'http://localhost:8089';

    constructor(private http: HttpClient) {}

    me(): Observable<Me> {
        return this.http.get<Me>(`${this.base}/api/auth/me`);
    }

    /**
     * Liste des séances pour la vue — on garde la signature (startISO/endISO)
     * mais on appelle le nouvel endpoint "today-seances" du backend.
     */
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

    /**
     * Récupère le roster de la séance et renvoie:
     *  - students: Student[]
     *  - marks: AttendanceMark[] (present bool mappé depuis current)
     */
    getRoster(sessionId: number): Observable<{ students: Student[]; marks: AttendanceMark[] }> {
        return this.http
            .get<RosterViewDTO>(`${this.base}/api/trainers/me/attendance/sessions/${sessionId}/roster`)
            .pipe(
                map(r => {
                    const students: Student[] = r.rows.map(row => ({
                        id: row.studentId,
                        fullName: row.fullName,
                        email: undefined
                    }));
                    const marks: AttendanceMark[] = r.rows.map(row => ({
                        studentId: row.studentId,
                        present: row.current === 'PRESENT'
                    }));
                    return { students, marks };
                })
            );
    }

    /**
     * Compat: si tu veux encore appeler les élèves du groupe par l’ancien endpoint.
     * (Gardé en secours; non obligatoire avec getRoster().)
     */
    studentsByGroupe(groupeId: number): Observable<Student[]> {
        return this.http.get<any>(`${this.base}/api/groups/${groupeId}`).pipe(
            map(g => (g?.students || []).map((s: any) => {
                const full = s.fullName ?? [s.fullname, s.fname, s.lname].filter(Boolean).join(' ').trim();
                return { id: s.id, fullName: full, email: s.email } as Student;
            }))
        );
    }

    /** Compat: renvoie uniquement les marks depuis le roster. */
    getAttendance(sessionId: number): Observable<AttendanceMark[]> {
        return this.getRoster(sessionId).pipe(map(r => r.marks));
    }

    /**
     * Sauvegarde en lot: convertit AttendanceMark -> PresenceMarkInput backend.
     */
    saveAttendance(sessionId: number, marks: AttendanceMark[]): Observable<void> {
        const payload = marks.map(m => ({
            studentId: m.studentId,
            statut: m.present ? 'PRESENT' : 'ABSENT'
        }));
        return this.http.post<void>(
            `${this.base}/api/trainers/me/attendance/sessions/${sessionId}/mark`,
            payload
        );
    }
}
