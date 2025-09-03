import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { StudentCoursesApi, CourseFileDTO } from './student-courses.api';

@Component({
    selector: 'app-student-courses',
    standalone: true,
    imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
    templateUrl: './student-courses.component.html',
    styleUrls: ['./student-courses.component.css'],
})
export class StudentCoursesComponent implements OnInit {
    private api = inject(StudentCoursesApi);
    private route = inject(ActivatedRoute);

    subject: string | null = null;
    loading = false;
    rows: CourseFileDTO[] = [];
    downloadingId: number | null = null;

    ngOnInit(): void {
        this.route.paramMap.subscribe((p) => {
            this.subject = p.get('subject');
            this.reload();
        });
    }

    reload(): void {
        this.loading = true;
        this.api.list(this.subject || undefined).subscribe({
            next: (r) => (this.rows = r || []),
            error: () => {
                this.rows = [];
                Swal.fire('Oops', 'Unable to load courses right now.', 'warning');
            },
            complete: () => (this.loading = false),
        });
    }

    download(row: CourseFileDTO): void {
        if (this.downloadingId) return;
        this.downloadingId = row.id;

        this.api.presignedDownload(row.id, 60).subscribe({
            next: (url) => {
                window.open(url, '_blank');
            },
            error: () => {
                Swal.fire('Error', 'Failed to get download link.', 'error');
            },
            complete: () => (this.downloadingId = null),
        });
    }

    /** Pour *ngFor trackBy : évite les re-renders inutiles */
    trackById = (_: number, r: CourseFileDTO) => r.id;

    /** Accent dégradé par matière (utilisé dans le template via [style.--accent]) */
    accentFor(subject: string | null): string {
        const key = (subject || '').trim().toLowerCase();
        const palette: Record<string, string> = {
            'backend (spring/node)': 'linear-gradient(135deg,#3b82f6,#6366f1)',
            'bases de données & sql': 'linear-gradient(135deg,#a855f7,#ec4899)',
            'calcul scientifique': 'linear-gradient(135deg,#ef4444,#f97316)',
            'théorie des langages': 'linear-gradient(135deg,#06b6d4,#22c55e)',
            'ip essentials': 'linear-gradient(135deg,#0ea5e9,#22c55e)',
        };
        return palette[key] || 'linear-gradient(135deg,#0ea5e9,#22c55e)';
    }

    /** Majuscule “propre” même si la donnée backend est en minuscule/mixte */
    prettySubject(subject: string | null): string {
        if (!subject) return '';
        return subject
            .split(' ')
            .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
            .join(' ');
    }

    formatSize(n: number): string {
        if (n < 1024) return `${n} B`;
        if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
        if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
        return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`;
    }
}
