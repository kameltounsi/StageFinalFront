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
}

@Injectable({ providedIn: 'root' })
export class StudentCoursesApi {
    private base = '/api/student/courses';
    constructor(private http: HttpClient) {}

    subjects() {
        return this.http.get<string[]>(`${this.base}/subjects`);
    }

    list(subject?: string) {
        let params = new HttpParams();
        if (subject) params = params.set('subject', subject);
        return this.http.get<CourseFileDTO[]>(this.base, { params });
    }

    presignedDownload(id: number, expMin = 60) {
        const params = new HttpParams().set('expMin', String(expMin));
        return this.http.get(`${this.base}/${id}/download`, { params, responseType: 'text' });
    }
    subjectsMeta() {
        // Optionnel : si inexistant côté back, on catchera côté composant
        return this.http.get<Record<string, { teacherName: string; teacherAvatarUrl?: string | null }>>(
            `${this.base}/subjects/meta`
        );
    }

}
