import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type UserStatus = 'ONLINE' | 'AWAY' | 'BUSY' | 'NOT_VISIBLE';

export interface UserMe {
    id: number;
    email: string;
    fullName: string;
    phone?: string | null;
    specialite?: string | null;
    bio?: string | null;
    location?: string | null;
    status?: UserStatus;
    avatar?: string | null; // URL
}

@Injectable({ providedIn: 'root' })
export class ProfileApi {
    constructor(private http: HttpClient) {}

    getMe() {
        return this.http.get<UserMe>('/api/users/me');
    }

    updateMe(payload: Partial<UserMe>) {
        return this.http.patch<UserMe>('/api/users/me', payload);
    }

    uploadAvatar(file: File) {
        const fd = new FormData();
        fd.append('file', file);
        return this.http.post<{ url: string }>('/api/users/me/avatar', fd);
    }

    deleteAvatar() {
        return this.http.delete<void>('/api/users/me/avatar');
    }

    changePassword(currentPassword: string, newPassword: string) {
        return this.http.patch<void>('/api/users/me/password', {
            currentPassword,
            newPassword,
        });
    }

    updateStatus(status: UserStatus) {
        return this.http.patch<void>('/api/users/me/status', { status });
    }
}
