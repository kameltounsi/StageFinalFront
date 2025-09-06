// src/app/modules/trainer-dashboard/trainer-dashboard.api.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

export type TrainerOverview = {
    myGroups: number;
    myStudents: number;
    sessionsThisWeek: number;
    pendingClaims: number;
    ungradedSubmissions: number;
};

export type TrainerGroupRow = {
    id: number;
    name: string;
    specialite: string;
    level: 'A' | 'B' | null;
    studentCount: number;
};

export type StudentMini = {
    id: number;
    fullName: string;
    email: string;
    profilePicture?: string;
};

export type ScheduleItem = {
    groupeId: number;
    groupeName: string;
    room: string;
    subject: string;
    start: string; // ISO date
    end: string;   // ISO date
};

@Injectable({ providedIn: 'root' })
export class TrainerDashboardApi {
    constructor(private http: HttpClient) {}

    overview() {
        return this.http.get<TrainerOverview>('/api/trainers/me/overview').pipe(
            catchError(() =>
                of<TrainerOverview>({
                    myGroups: 0,
                    myStudents: 0,
                    sessionsThisWeek: 0,
                    pendingClaims: 0,
                    ungradedSubmissions: 0,
                })
            )
        );
    }

    groups() {
        return this.http.get<TrainerGroupRow[]>('/api/trainers/me/groups').pipe(
            catchError(() => of<TrainerGroupRow[]>([]))
        );
    }

    students(groupId: number) {
        return this.http
            .get<StudentMini[]>(`/api/trainers/me/groups/${groupId}/students`)
            .pipe(catchError(() => of<StudentMini[]>([])));
    }

    week(startISO?: string) {
        const url = startISO
            ? `/api/trainers/me/schedule/week?start=${startISO}`
            : `/api/trainers/me/schedule/week`;
        return this.http.get<ScheduleItem[]>(url).pipe(catchError(() => of<ScheduleItem[]>([])));
    }
}
