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

@Injectable({ providedIn: 'root' })
export class StudentNotesApi {
    constructor(private http: HttpClient) {}

    getMyNotes() {
        return this.http.get<StudentNoteDTO[]>('/api/student/notes');
    }
}
