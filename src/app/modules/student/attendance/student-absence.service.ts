// src/app/modules/student/attendance/student-absence.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface StudentAbsenceItem {
    id: number;           // presenceId
    date: string;
    start: string;
    end: string;
    course: string;
    group: string;
    room?: string | null;
    justified: boolean | null;
    reason?: string | null;
}

export interface AbsenceStats {
    total: number;
    justified: number;
    unjustified: number;
}

/** Forme renvoyée par le backend (Swagger) */
interface StudentAbsenceSummaryDTO {
    total: number;
    justified: number;
    unJustified: number;  // ⚠️ nom avec 'J' majuscule côté API
    items: Array<{
        presenceId: number;
        date: string;
        start: string;      // ou heureDebut selon mapping
        end: string;        // ou heureFin selon mapping
        matiere?: string;
        groupeNom?: string;
        salle?: string;
        justified?: boolean | null;
        justificationNote?: string | null;
    }>;
}

@Injectable({ providedIn: 'root' })
export class StudentAbsenceService {
    private base = 'http://localhost:8089';

    constructor(private http: HttpClient) {}

    /**
     * GET /api/students/me/absences?start=YYYY-MM-DD&end=YYYY-MM-DD
     * Retour attendu: StudentAbsenceSummaryDTO
     */
    list(start?: string, end?: string): Observable<{ rows: StudentAbsenceItem[]; stats: AbsenceStats }> {
        let params = new HttpParams();
        if (start) params = params.set('start', start);
        if (end)   params = params.set('end', end);

        return this.http
            .get<StudentAbsenceSummaryDTO>(`${this.base}/api/students/me/absences`, { params })
            .pipe(
                map((summary: any) => {
                    // Tolérance: si jamais l’API renvoie directement un tableau (héritage),
                    // on normalise ici aussi.
                    if (Array.isArray(summary)) {
                        const rows: StudentAbsenceItem[] = summary.map((r: any, i: number) => ({
                            id: r.presenceId ?? r.id ?? i,
                            date: r.date,
                            start: r.start ?? r.heureDebut,
                            end: r.end ?? r.heureFin,
                            course: r.matiere ?? r.course ?? '',
                            group: r.groupeNom ?? r.group ?? '',
                            room: r.salle ?? r.room ?? null,
                            justified: r.justified ?? r.isJustified ?? null,
                            reason: r.justificationNote ?? r.reason ?? null
                        }));
                        const stats: AbsenceStats = {
                            total: rows.length,
                            justified: rows.filter(x => x.justified === true).length,
                            unjustified: rows.filter(x => x.justified === false).length
                        };
                        return { rows, stats };
                    }

                    // Chemin normal (objet résumé)
                    const s: StudentAbsenceSummaryDTO = summary;
                    const rows: StudentAbsenceItem[] = (s.items || []).map((r, i) => ({
                        id: r.presenceId ?? i,
                        date: r.date,
                        start: (r as any).start ?? (r as any).heureDebut, // compat
                        end:   (r as any).end   ?? (r as any).heureFin,   // compat
                        course: r.matiere ?? '',
                        group: r.groupeNom ?? '',
                        room: r.salle ?? null,
                        justified: r.justified ?? null,
                        reason: r.justificationNote ?? null
                    }));

                    const stats: AbsenceStats = {
                        total: s.total ?? rows.length,
                        justified: s.justified ?? rows.filter(x => x.justified === true).length,
                        unjustified: (s.unJustified ?? (rows.filter(x => x.justified === false).length))
                    };

                    return { rows, stats };
                })
            );
    }
}
