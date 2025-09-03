// src/app/modules/student/notes/student-notes.api.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface StudentNoteDTO {
    matiere: string;
    cc: number | null;
    examen: number | null;
    moyenne: number | null;
    weightCc: number | null;
    weightExam: number | null;
    commentaire: string | null;
}

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
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    tutorReply: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface NoteClaimRequest {
    matiere: string;
    message: string;
    proposedCc?: number | null;
    proposedExamen?: number | null;
}

@Injectable({ providedIn: 'root' })
export class StudentNotesApi {
    constructor(private http: HttpClient) {}

    getMyNotes() {
        return this.http.get<StudentNoteDTO[]>('/api/student/notes');
    }

    getMyClaims() {
        return this.http.get<NoteClaimDTO[]>('/api/student/notes/claims');
    }

    submitClaim(payload: NoteClaimRequest) {
        return this.http.post<NoteClaimDTO>('/api/student/notes/claims', payload);
    }
}
