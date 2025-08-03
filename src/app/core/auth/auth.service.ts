import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import {catchError, Observable, of, switchMap, tap, throwError} from 'rxjs';
import {AuthResponse} from "./auth-response.model";

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set token(token: string) {
        localStorage.setItem('token', token);
    }

    get token(): string {
        return localStorage.getItem('token') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
/*

     * Forgot password
     *
     * @param email

    forgotPassword(email: string): Observable<string> {
        return this._httpClient.post('http://localhost:8089/api/auth/forgot-password', null, {
            params: { email },
            responseType: 'text'
        });
    }*/
    forgotPassword(email: string): Observable<string> {
        return this._httpClient.post(
            'http://localhost:8089/api/auth/forgot-password',
            { email }, // corps de la requête en JSON
            { responseType: 'text' }
        );
    }


    /**
     * Reset password
     *
     * @param email
     * @param newPassword
     */
    resetPassword(email: string, newPassword: string): Observable<any> {
        return this._httpClient.post(
            `http://localhost:8089/api/auth/reset-password`,
            null,
            {
                params: {
                    email,
                    newPassword
                },
                responseType: 'text' // facultatif, selon la réponse de ton backend
            }
        );
    }

    /**
     * Sign in
     *
     * @param credentials
     */
 /*   signIn(credentials: { email: string; password: string }): Observable<any> {
        return this._httpClient.post('api/auth/login', credentials).pipe(
            switchMap((response: any) => {
                this.accessToken = response.accessToken;
                this._authenticated = true;
                this._userService.user = response.user;
                return of(response);
            })
        );
    }
*/
signIn(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this._httpClient.post<AuthResponse>('http://localhost:8089/api/auth/login', credentials).pipe(
        tap((response) => {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        })
    );
}



    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Sign in using the token
        return this._httpClient
            .post('api/auth/sign-in-with-token', {
                token: this.token,
            })
            .pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap((response: any) => {
                    // Replace the access token with the new one if it's available on
                    // the response object.
                    //
                    // This is an added optional step for better security. Once you sign
                    // in using the token, you should generate a new one on the server
                    // side and attach it to the response object. Then the following
                    // piece of code can replace the token with the refreshed one.
                    if (response.token) {
                        this.token = response.token;
                    }

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Store the user on the user service
                    this._userService.user = response.user;

                    // Return true
                    return of(true);
                })
            );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('token');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    /*
    signUp(user: {
        name: string;
        email: string;
        password: string;
        company: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }*/
    signUp(formData: FormData): Observable<any> {
        return this._httpClient.post('api/auth/register', formData);
    }


    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Si déjà authentifié, OK
        if (this._authenticated) {
            return of(true);
        }

        const token = localStorage.getItem('token');
        const userJson = localStorage.getItem('user');

        // Si pas de token ou expiré, KO
        if (!token || AuthUtils.isTokenExpired(token)) {
            return of(false);
        }

        // ✅ On charge le user sauvegardé
        const user = userJson ? JSON.parse(userJson) : null;

        if (!user) {
            return of(false);
        }

        // Met à jour le user et l'état local
        this.token = token;
        this._userService.user = user;
        this._authenticated = true;

        return of(true);
    }


    verifyCode(email: string, code: string): Observable<any> {
        return this._httpClient.post('api/auth/verify-code', null, {
            params: { email, code },
            responseType: 'text'
        });
    }
    submitRequest(formData: FormData): Observable<any> {
        return this._httpClient.post('http://localhost:8089/api/requests/submit', formData);
    }

}
