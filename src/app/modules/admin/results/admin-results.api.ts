import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface AdminStudentResultDTO {
    studentId: number;
    studentName: string;
    studentEmail: string;
    subjectAverages: Record<string, number | null>;
    missingSubjects: string[];
    overall: number | null;
    status: 'ADMITTED' | 'REJECTED' | 'INCOMPLETE';
}

export interface AdminGroupResultsPreviewDTO {
    groupId: number;
    groupName: string;
    specialite: string;
    expectedSubjects: string[];
    students: AdminStudentResultDTO[];
    admittedCount: number;
    refusedCount: number;     // keep field name aligned with backend
    incompleteCount: number;
    allComplete: boolean;
    suggestedNextGroupName: string | null;
    suggestedNextGroupId: number | null;
}

export interface AdminApplyResultsRequest {
    groupeId: number;
    targetGroupId?: number | null;
}

export interface AdminApplyResultsResponse {
    sourceGroupId: number;
    targetGroupId: number;
    targetGroupName: string;
    movedCount: number;
    stayedCount: number;
    purgedNotesCount: number;
    purgedClaimsCount: number;
}

@Injectable({ providedIn: 'root' })
export class AdminResultsApi {
    private base = '/api/admin/results';
    constructor(private http: HttpClient) {}

    preview(groupeId: number) {
        const params = new HttpParams().set('groupeId', String(groupeId));
        return this.http.get<AdminGroupResultsPreviewDTO>(`${this.base}/preview`, { params });
    }

    apply(body: AdminApplyResultsRequest) {
        return this.http.post<AdminApplyResultsResponse>(`${this.base}/apply`, body);
    }
}
