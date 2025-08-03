import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {User} from "../../../../core/user/user.types";

@Injectable({
    providedIn: 'root'
})
export class ManageUsersService {
    private baseUrl = 'http://localhost:8089/api/auth';
    private apiUrl = 'http://localhost:8089/api'; // ⚡ adapte ton backend URL

    constructor(private http: HttpClient) {}

    /**
     * Récupérer tous les utilisateurs
     */
    getAllUsers(): Observable<User[]> {
        const token = localStorage.getItem('access_token'); // ou le nom réel
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<User[]>('http://localhost:8089/api/auth/all', { headers });
    }


    /**
     * Mettre à jour le rôle d’un utilisateur
     * @param userId L'identifiant de l'utilisateur
     * @param newRole Le nouveau rôle à attribuer (ADMIN, TRAINER, STUDENT)
     */
    updateUserRole(userId: number, newRole: string): Observable<any> {
        const token = localStorage.getItem('access_token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        const params = new HttpParams().set('role', newRole);

        return this.http.put(`${this.baseUrl}/${userId}/role`, null, { headers, params });
    }
    addUser(userData: FormData): Observable<any> {
        const token = localStorage.getItem('access_token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.baseUrl}/add-user`, userData, { headers });
    }
    checkEmail(email: string): Observable<{ exists: boolean }> {
        return this.http.get<{ exists: boolean }>(
            `${this.baseUrl}/check-email`,
            { params: { email } }
        );
    }
    // ⚡ Nouvelle méthode : récupérer les requests PENDING
    getPendingRequests(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/requests/pending`);
    }

    // ⚡ Nouvelle méthode : mettre à jour le statut (approve/reject)
    updateRequestStatus(requestId: number, status: 'APPROVED' | 'REJECTED'): Observable<any> {
        return this.http.put(`${this.apiUrl}/requests/${requestId}/status`, { status });
    }


}