// src/app/modules/student-dashboard/student-dashboard.api.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

export type StudentOverview = {
    studentName: string | null;
    groupId: number | null;
    groupName: string | null;
    specialite: string | null;
    level: string | null;

    average: number | null;
    attendedSessions: number;
    missedSessions: number;
    pendingClaims: number;
    unreadMessages: number;

    nextSession: {
        start: string;
        end: string;
        subject: string;
        room: string;
        trainerName: string;
    } | null;
};

export type DaySession = {
    start: string;
    end: string;
    subject: string;
    room: string;
    trainerName: string;
};

export type GradeRow = {
    subject: string;
    average: number;
    doneControls: number;
    totalControls: number;
    status: string;
};

@Injectable({ providedIn: 'root' })
export class StudentDashboardApi {
    constructor(private http: HttpClient) {}

    overview() {
        return this.http.get<StudentOverview>('/api/student/dashboard/overview').pipe(
            catchError(() =>
                of<StudentOverview>({
                    studentName: null,
                    groupId: null,
                    groupName: null,
                    specialite: null,
                    level: null,
                    average: null,
                    attendedSessions: 0,
                    missedSessions: 0,
                    pendingClaims: 0,
                    unreadMessages: 0,
                    nextSession: null,
                })
            )
        );
    }

    today() {
        return this.http.get<DaySession[]>('/api/student/dashboard/today').pipe(
            catchError(() => of<DaySession[]>([]))
        );
    }

    grades() {
        return this.http.get<GradeRow[]>('/api/student/dashboard/grades').pipe(
            catchError(() => of<GradeRow[]>([]))
        );
    }
}
