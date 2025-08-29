// app/modules/trainer/weekly-schedule/weekly-schedule.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Structure minimale renvoyée par le backend pour un créneau
export interface WeeklyItem {
    id: number;
    date: string;        // 'YYYY-MM-DD'
    heureDebut: string;  // 'HH:mm'
    heureFin: string;    // 'HH:mm'
    matiere: string;
    salle: string;

    // Le backend peut renvoyer soit un nom direct, soit un objet groupe
    groupeNom?: string;
    groupe?: {
        id: number;
        nom?: string;
        specialite?: string;
    };
}

@Injectable({ providedIn: 'root' })
export class WeeklyScheduleService {
    private readonly baseUrl = '/api';

    constructor(private http: HttpClient) {}

    /**
     * Emploi du temps de la semaine pour l'utilisateur connecté (via token)
     * GET /api/trainers/me/weekly-schedule?start=YYYY-MM-DD&end=YYYY-MM-DD
     */
    getMyWeek(start: string, end: string): Observable<WeeklyItem[]> {
        return this.http.get<WeeklyItem[]>(
            `${this.baseUrl}/trainers/me/weekly-schedule`,
            { params: { start, end } }
        );
    }

    /**
     * (Optionnel – utile pour l’admin) Emploi du temps d’un formateur spécifique
     * GET /api/trainers/{trainerId}/weekly-schedule?start=YYYY-MM-DD&end=YYYY-MM-DD
     */
    getTrainerWeek(trainerId: number, start: string, end: string): Observable<WeeklyItem[]> {
        return this.http.get<WeeklyItem[]>(
            `${this.baseUrl}/trainers/${trainerId}/weekly-schedule`,
            { params: { start, end } }
        );
    }
    /** PDF de ma semaine (plage start/end) */
    downloadMyWeekPdf(start: string, end: string) {
        return this.http.get(
            `${this.baseUrl}/trainersschedule/me/weekly-schedule.pdf`,
            { params: { start, end }, responseType: 'blob' as 'json' }
        );
    }

    /** PDF de ma semaine (date quelconque appartenant à la semaine) */
    downloadMyWeekPdfByDate(weekDate: string) {
        return this.http.get(
            `${this.baseUrl}/trainersschedule/me/weekly-schedule.pdf`,
            { params: { weekDate }, responseType: 'blob' as 'json' }
        );
    }

}
