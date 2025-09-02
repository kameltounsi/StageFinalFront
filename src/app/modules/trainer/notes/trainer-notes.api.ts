// src/app/modules/trainer/notes/trainer-notes.api.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface TrainerNoteRow {
    studentId: number;
    studentName: string;
    studentEmail: string;
    cc: number | null;
    examen: number | null;
    moyenne: number | null;
}

export interface SaveNotesRequest {
    groupeId: number;        // alias groupId accepté côté back
    matiere: string;
    weightCc: number;        // 0.4 ou 0.2
    weightExam: number;      // 0.6 ou 0.8
    items: {
        studentId: number;
        cc: number | null;
        examen: number | null;
        commentaire?: string | null;
    }[];
}

@Injectable({ providedIn: 'root' })
export class TrainerNotesApi {
    private base = '/api/trainer/notes';

    constructor(private http: HttpClient) {}

    loadSheet(groupeId: number, matiere: string) {
        const params = new HttpParams()
            .set('groupeId', String(groupeId))
            .set('matiere', matiere);

        return this.http.get<TrainerNoteRow[]>(`${this.base}/sheet`, { params });
    }

    saveSheet(body: SaveNotesRequest) {
        return this.http.post<{ status: 'ok' }>(`${this.base}/bulk`, body);
    }
}
