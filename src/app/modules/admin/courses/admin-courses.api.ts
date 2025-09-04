import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CourseFileDTO {
    id: number;
    title: string;
    contentType: string;
    sizeBytes: number;
    createdAt: string;
    groupeId: number | null;
    groupeName: string | null;
    subject: string | null;
    trainerId?: number | null;
    trainerEmail?: string | null;
}

export interface TrainerDTO {
    id: number;
    fullName: string | null;
    email: string;
    specialite?: string | null;
}

export interface GroupDTO {
    id: number;
    nom: string;
    specialite?: string | null;
    students?: any[] | null;
}

export interface AdminCoursesMeta {
    groups: GroupDTO[];
    subjects: string[];
    trainers: TrainerDTO[];
    specialites: string[];
}

@Injectable({ providedIn: 'root' })
export class AdminCoursesApi {
    private base = '/api/admin/courses';
    constructor(private http: HttpClient) {}

    meta(): Observable<AdminCoursesMeta> {
        return this.http.get<AdminCoursesMeta>(`${this.base}/meta`);
    }

    list(params: {
        groupId?: number;
        subject?: string;
        trainerId?: number;
        q?: string;
        specialite?: string;
    }): Observable<CourseFileDTO[]> {
        let p = new HttpParams();
        if (params.groupId)   p = p.set('groupId', params.groupId);
        if (params.subject && params.subject.trim())   p = p.set('subject', params.subject.trim());
        if (params.trainerId) p = p.set('trainerId', params.trainerId);
        if (params.q && params.q.trim())               p = p.set('q', params.q.trim());
        if (params.specialite && params.specialite.trim()) {
            p = p.set('specialite', params.specialite.trim());
        }
        return this.http.get<CourseFileDTO[]>(this.base, { params: p });
    }

    presignedDownload(id: number, expMin = 60): Observable<string> {
        return this.http.get(`${this.base}/${id}/download`, {
            params: new HttpParams().set('expMin', expMin),
            responseType: 'text'
        }) as unknown as Observable<string>;
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }
}
