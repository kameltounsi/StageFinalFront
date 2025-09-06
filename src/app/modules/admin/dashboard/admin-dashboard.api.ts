// src/app/core/admin/admin-dashboard.api.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, of } from 'rxjs';

export interface AdminOverview {
    students: { total: number; unassigned: number; newThisMonth: number };
    groups: { total: number; lowCapacity: number };
    claims: { pending: number };
    promotionReadyGroups: number;
}

export interface GroupStatusRow {
    id: number;
    name: string;
    specialite: string;
    level: 'A' | 'B' | null;
    studentCount: number;
    studentCapacityLeft: number;
    trainerCapacityLeft: number;
    pendingClaims: number;
    gradingComplete: boolean;
    admittedCount: number;
    rejectedCount: number;
    incompleteCount: number;
}

export interface LevelStats { levelA: number; levelB: number; }
export interface SpecialiteCount { specialite: string; count: number; }

@Injectable({ providedIn: 'root' })
export class AdminDashboardApi {
    // Si tu n’utilises PAS le proxy Angular, remplace par: 'http://localhost:8089/api/admin'
    private readonly base = '/api/admin';

    constructor(private http: HttpClient) {}

    // -- Helpers ---------------------------------------------------------------

    /** Récupère le JWT depuis localStorage et construit les headers. */
    private authHeaders(): HttpHeaders {
        const raw =
            localStorage.getItem('accessToken') ||
            localStorage.getItem('token') ||
            localStorage.getItem('jwt') ||
            localStorage.getItem('auth_token') ||
            '';

        if (!raw) return new HttpHeaders();

        const value = raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`;
        return new HttpHeaders({ Authorization: value });
    }

    private get<T>(path: string) {
        return this.http.get<T>(`${this.base}${path}`, { headers: this.authHeaders() });
    }

    private post<T>(path: string, body: any) {
        return this.http.post<T>(`${this.base}${path}`, body, { headers: this.authHeaders() });
    }

    // -- API -------------------------------------------------------------------

    getOverview() {
        return this.get<AdminOverview>('/overview').pipe(
            catchError(() =>
                of<AdminOverview>({
                    students: { total: 0, unassigned: 0, newThisMonth: 0 },
                    groups: { total: 0, lowCapacity: 0 },
                    claims: { pending: 0 },
                    promotionReadyGroups: 0,
                })
            )
        );
    }

    getGroupStatus() {
        return this.get<GroupStatusRow[]>('/groups/status').pipe(
            catchError(() => of<GroupStatusRow[]>([]))
        );
    }

    getLevelStats() {
        return this.get<LevelStats>('/stats/levels').pipe(
            catchError(() => of<LevelStats>({ levelA: 0, levelB: 0 }))
        );
    }

    getStudentsBySpecialite() {
        return this.get<SpecialiteCount[]>('/stats/students-by-specialite').pipe(
            catchError(() => of<SpecialiteCount[]>([]))
        );
    }

    applyPromotion(groupeId: number) {
        return this.post<{
            sourceGroupId: number;
            targetGroupId: number;
            targetGroupName: string;
            movedCount: number;
            stayedCount: number;
            purgedNotesCount: number;
            purgedClaimsCount: number;
        }>('/results/apply', { groupeId });
    }
}
