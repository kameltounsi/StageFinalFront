// src/app/modules/trainer/claims/trainer-claims.api.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface NoteClaimDTO {
    id: number;
    matiere: string;
    message: string;
    cc: number | null;
    examen: number | null;
    moyenne: number | null;
    weightCc: number | null;
    weightExam: number | null;
    proposedCc: number | null;
    proposedExamen: number | null;
    status: ClaimStatus;
    tutorReply: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ClaimDecisionRequest {
    newCc?: number | null;
    newExamen?: number | null;
    reply?: string | null;
}

@Injectable({ providedIn: 'root' })
export class TrainerClaimsApi {
    private base = '/api/trainer/notes/claims';
    constructor(private http: HttpClient) {}

    inbox() {
        return this.http.get<NoteClaimDTO[]>(this.base);
    }
    approve(id: number, body: ClaimDecisionRequest) {
        return this.http.patch<NoteClaimDTO>(`${this.base}/${id}/approve`, body ?? {});
    }
    reject(id: number, body: ClaimDecisionRequest) {
        return this.http.patch<NoteClaimDTO>(`${this.base}/${id}/reject`, body);
    }
}
