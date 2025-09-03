// src/app/modules/trainer/courses/trainer-courses.api.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface CourseFileDTO {
    id: number;
    title: string;
    contentType: string;
    sizeBytes: number;
    createdAt: string;
    groupeId: number;
    groupeName: string;
    subject: string;
    presignedUrl?: string | null;
}

export interface Groupe { id: number; nom: string; specialite: string; }

@Injectable({ providedIn: 'root' })
export class TrainerCoursesApi {
    private base = '/api/trainer/courses';

    constructor(private http: HttpClient) {}

    list(trainerId: number, groupeId?: number) {
        let params = new HttpParams().set('trainerId', trainerId);
        if (groupeId) params = params.set('groupeId', groupeId);
        return this.http.get<CourseFileDTO[]>(this.base, { params });
    }

    upload(file: File, trainerId: number, groupeId: number, subject: string) {
        const form = new FormData();
        form.append('file', file);
        form.append('trainerId', String(trainerId));
        form.append('groupeId', String(groupeId));
        form.append('subject', subject);
        return this.http.post<{ id: number; title: string; groupeId: number; subject: string }>(this.base, form);
    }

    presignedDownload(id: number, trainerId: number, expMin = 60) {
        const params = new HttpParams()
            .set('trainerId', String(trainerId))
            .set('expMin', String(expMin));
        return this.http.get(this.base + `/${id}/download`, { params, responseType: 'text' });
    }

    delete(id: number, trainerId: number) {
        const params = new HttpParams().set('trainerId', String(trainerId));
        return this.http.delete<void>(this.base + `/${id}`, { params });
    }

    // déjà existant côté back
    myGroups() {
        return this.http.get<Groupe[]>('/api/trainer/my-groups');
    }

    // récupère les 3 matières autorisées pour un groupe
    subjectsForGroup(groupeId: number) {
        const params = new HttpParams().set('groupeId', String(groupeId));
        return this.http.get<string[]>(`${this.base}/subjects`, { params });
    }
}
