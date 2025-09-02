// src/app/modules/trainer/notes/trainer-notes.api.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface TrainerNoteRow {
    studentId: number;
    studentName: string;
    studentEmail: string;
    valeur: number | null;
    commentaire: string | null;
    matiere: string;
    date: string; // ISO yyyy-MM-dd
}

export interface SaveNotesRequest {
    groupeId: number;            // <-- important: "groupeId"
    matiere: string;
    date: string;                // ISO yyyy-MM-dd
    items: { studentId: number; valeur: number | null; commentaire?: string | null }[];
}

@Injectable({ providedIn: 'root' })
export class TrainerNotesApi {
    private base = '/api/trainer/notes'; // <-- préfixe correct

    constructor(private http: HttpClient) {}

    loadSheet(groupeId: number, matiere: string, dateIso: string) {
        const params = new HttpParams()
            .set('groupeId', String(groupeId))
            .set('matiere', matiere)
            .set('date', dateIso);

        return this.http.get<TrainerNoteRow[]>(`${this.base}/sheet`, { params });
    }

    saveSheet(body: SaveNotesRequest) {
        // @JsonAlias sur le back accepte aussi "groupId", mais on envoie "groupeId" pour rester clean
        return this.http.post<{ status: 'ok' }>(`${this.base}/bulk`, body);
    }
}
