import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { StudentCoursesApi } from './student-courses.api';

type SubjectMetaMap = Record<string, { teacherName: string; teacherAvatarUrl?: string | null }>;

@Component({
    selector: 'app-student-rooms',
    standalone: true,
    imports: [CommonModule, RouterModule, MatIconModule, MatRippleModule],
    templateUrl: './student-rooms.component.html',
    styleUrls: ['./student-rooms.component.css'],
})
export class StudentRoomsComponent implements OnInit {
    private api = inject(StudentCoursesApi);

    loading = false;
    subjects: string[] = [];
    meta: SubjectMetaMap = {};

    // density (toujours dispo)
    density: 'comfortable' | 'compact' = (localStorage.getItem('gc-density') as any) || 'comfortable';

    ngOnInit(): void {
        this.loading = true;
        document.documentElement.style.setProperty('--gc-density', this.density);

        this.api.subjects().subscribe({
            next: subs => {
                this.subjects = (subs || []).slice();
                // Essayer de charger la meta prof; si 404 -> fallback silencieux
                this.api.subjectsMeta().subscribe({
                    next: (m) => (this.meta = m || {}),
                    error: () => (this.meta = {}),
                    complete: () => (this.loading = false),
                });
            },
            error: () => {
                this.subjects = [];
                this.loading = false;
            },
        });
    }

    setDensity(v: 'comfortable' | 'compact') {
        this.density = v;
        localStorage.setItem('gc-density', v);
        document.documentElement.style.setProperty('--gc-density', v);
    }

    trackByIndex = (i: number) => i;

    /** Nom sujet en Majuscule Initiale (title case FR-friendly simple) */
    titleCase(s: string): string {
        if (!s) return s;
        return s
            .toLowerCase()
            .split(/(\s+|-|_)/g)
            .map(part => /^[\s\-_]+$/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1))
            .join('');
    }

    /** Deux lettres si possible pour avatar texte */
    initials(s: string): string {
        if (!s) return '?';
        const parts = s.trim().split(/\s+/);
        const first = parts[0]?.[0] ?? '';
        const second = parts[1]?.[0] ?? '';
        return (first + second).toUpperCase() || '?';
    }

    /** Palette stable HSL à partir du sujet */
    private hashHue(input: string): number {
        let h = 0; for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
        return Math.abs(h) % 360;
    }
    accentFor(s: string, alt = false): string {
        const hue = this.hashHue(s);
        const sat = alt ? 72 : 86;
        const light = alt ? 54 : 46;
        return `hsl(${hue}, ${sat}%, ${light}%)`;
    }

    teacherName(subject: string): string {
        return this.meta[subject]?.teacherName || 'Teacher';
    }
    teacherAvatar(subject: string): string | null | undefined {
        return this.meta[subject]?.teacherAvatarUrl || null;
    }
}
