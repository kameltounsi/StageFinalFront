import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { AdminCoursesApi, CourseFileDTO, AdminCoursesMeta, TrainerDTO, GroupDTO } from './admin-courses.api';

@Component({
    selector: 'app-admin-courses',
    standalone: true,
    imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, FormsModule],
    templateUrl: './admin-courses.component.html',
    styleUrls: ['./admin-courses.component.css'],
})
export class AdminCoursesComponent implements OnInit {
    private api = inject(AdminCoursesApi);

    loading = signal(false);
    rows: CourseFileDTO[] = [];

    meta: AdminCoursesMeta = { groups: [], trainers: [], subjects: [], specialites: [] };

    // Filtres (specialite d’abord)
    specialite: string | null = null;
    groupId: number | null = null;
    subject: string | null = null;
    trainerId: number | null = null;
    q = '';

    // debounce timer
    private searchTimer: any;

    get filteredTrainers(): TrainerDTO[] {
        if (!this.specialite || !this.specialite.trim()) return this.meta.trainers;
        const s = this.specialite.trim().toLowerCase();
        return this.meta.trainers.filter(t => (t.specialite || '').toLowerCase() === s);
    }

    get filteredGroups(): GroupDTO[] {
        const groups = this.meta.groups || [];
        if (!this.specialite || !this.specialite.trim()) return groups;
        const s = this.specialite.trim().toLowerCase();
        const hasSpecField = groups.some(g => typeof g.specialite === 'string' && g.specialite !== null);
        if (!hasSpecField) return groups;
        return groups.filter(g => (g.specialite || '').toLowerCase() === s);
    }

    ngOnInit(): void {
        this.fetchMeta();
        this.reload();
    }

    fetchMeta() {
        this.api.meta().subscribe({
            next: (m) => (this.meta = m || { groups: [], trainers: [], subjects: [], specialites: [] }),
            error: () => (this.meta = { groups: [], trainers: [], subjects: [], specialites: [] }),
        });
    }

    onSpecialiteChanged() {
        this.groupId = null;
        this.subject = null;
        this.trainerId = null;
        this.reload();
    }

    onSearchInput() {
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => this.reload(), 300);
    }

    reload() {
        this.loading.set(true);
        this.api
            .list({
                groupId: this.groupId ?? undefined,
                subject: this.subject?.trim() || undefined,
                trainerId: this.trainerId ?? undefined,
                q: this.q?.trim() || undefined,
                specialite: this.specialite?.trim() || undefined,
            })
            .subscribe({
                next: (r) => (this.rows = r || []),
                error: () => { this.rows = []; this.loading.set(false); },
                complete: () => this.loading.set(false),
            });
    }

    clearFilters() {
        this.specialite = null;
        this.groupId = null;
        this.subject = null;
        this.trainerId = null;
        this.q = '';
        this.reload();
    }

    download(row: CourseFileDTO) {
        this.api.presignedDownload(row.id, 60).subscribe({
            next: (url) => window.open(url, '_blank'),
            error: () => Swal.fire('Error', 'Failed to get download link.', 'error'),
        });
    }

    remove(row: CourseFileDTO) {
        Swal.fire({
            icon: 'warning',
            title: 'Delete this course?',
            text: `${row.title} — ${row.groupeName} / ${row.subject}`,
            showCancelButton: true,
            confirmButtonText: 'Delete',
        }).then((r) => {
            if (!r.isConfirmed) return;
            this.api.delete(row.id).subscribe({
                next: () => {
                    Swal.fire('Deleted', 'Course removed.', 'success');
                    this.reload();
                },
                error: () => Swal.fire('Error', 'Delete failed.', 'error'),
            });
        });
    }

    formatSize(n: number) {
        if (n < 1024) return `${n} B`;
        if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
        if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
        return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`;
    }

    initialOf(emailOrName: string | undefined | null) {
        const v = (emailOrName || '').trim();
        if (!v) return 'U';
        const letter = v[0]!.toUpperCase();
        return /[A-Z]/.test(letter) ? letter : 'U';
    }
}
