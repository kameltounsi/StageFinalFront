// src/app/core/user/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {User} from "../../../core/user/user.types";

const LS_KEY = 'user';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _user = new BehaviorSubject<User | null>(null);
    readonly user$ = this._user.asObservable();

    constructor(private http: HttpClient) {
        this._hydrateFromStorage();
    }

    /** Current user snapshot (may be null if not loaded/authenticated). */
    get current(): User | null {
        return this._user.value;
    }

    /** Force reload from backend and persist to local storage. */
    refresh(): Observable<User> {
        return this.http.get<User>('/api/users/me').pipe(
            tap((u) => {
                this._user.next(u);
                this._persist(u);
            }),
            catchError((err) => {
                if (err?.status === 401) {
                    this.clear();
                }
                return throwError(() => err);
            })
        );
    }

    /**
     * Upload and set the profile picture.
     * - POST /api/users/me/avatar (FormData: { file })
     * - Immediately patches local state so UI (header/menu) updates instantly
     * - Persists to localStorage
     */
    updateProfilePicture(file: File): Observable<User> {
        const fd = new FormData();
        fd.append('file', file);

        return this.http.post<{ url: string }>('/api/users/me/avatar', fd).pipe(
            tap((res) => {
                const url = res?.url;
                if (url) {
                    // Keep both profilePicture and avatar in sync for legacy bindings
                    this.patchLocal({ profilePicture: url, avatar: url } as Partial<User>);
                }
            }),
            map(() => this._user.value as User)
        );
    }

    /**
     * Instantly patch the in-memory user (and localStorage) and emit to subscribers.
     * Use this for UI that must update immediately (avatar, status badge, etc.).
     */
    patchLocal(patch: Partial<User>): void {
        const curr = this._user.value;
        if (!curr) return;

        // Keep both `profilePicture` and (legacy) `avatar` in sync if present
        const extra: Partial<User> = { ...patch };
        if (patch.profilePicture && !(patch as any).avatar) {
            (extra as any).avatar = patch.profilePicture as any;
        }
        if ((patch as any).avatar && !patch.profilePicture) {
            (extra as any).profilePicture = (patch as any).avatar as any;
        }

        const next: User = { ...curr, ...extra } as User;
        this._user.next(next);
        this._persist(next);
    }

    /**
     * Backward-compatible helper used in some components as `userService.update(...)`.
     * It patches locally and returns an observable of the new value.
     * (Server persistence is handled by specific endpoints like /avatar or /password.)
     */
    update(patch: Partial<User>): Observable<User> {
        this.patchLocal(patch);
        return of(this._user.value as User);
    }

    /** Convenience: set avatar URL instantly (syncs both `profilePicture` and `avatar`). */
    setAvatarUrl(url: string): void {
        this.patchLocal({ profilePicture: url, avatar: url } as Partial<User>);
    }

    /** Optional: call backend to change password (not required by your current component). */
    changePassword(currentPassword: string, newPassword: string): Observable<void> {
        return this.http
            .post<void>('/api/users/me/password', { currentPassword, newPassword })
            .pipe(tap(() => {}));
    }

    /** Clear user from memory and storage (e.g., on sign-out). */
    clear(): void {
        this._user.next(null);
        try {
            localStorage.removeItem(LS_KEY);
        } catch {}
    }

    // -----------------------
    // Private helpers
    // -----------------------

    private _hydrateFromStorage(): void {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw) as User | null;
            if (parsed) this._user.next(parsed);
        } catch {
            // ignore parse errors
        }
    }

    private _persist(user: User | null): void {
        try {
            if (user) localStorage.setItem(LS_KEY, JSON.stringify(user));
            else localStorage.removeItem(LS_KEY);
        } catch {
            // ignore storage errors
        }
    }
}
