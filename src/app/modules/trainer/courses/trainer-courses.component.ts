// src/app/modules/trainer/courses/trainer-courses.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TrainerCoursesApi, CourseFileDTO, Groupe } from './trainer-courses.api';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-trainer-courses',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatFormFieldModule, MatSelectModule],
    templateUrl: './trainer-courses.component.html',
    styleUrls: ['./trainer-courses.component.css'],
})
export class TrainerCoursesComponent implements OnInit {
    private api = inject(TrainerCoursesApi);

    trainerId = 1; // TODO: lire depuis le profil/token
    loading = signal(false);

    groups: Groupe[] = [];
    subjects: string[] = [];

    selectedGroup: number | null = null;
    selectedSubject: string | null = null;

    rows: CourseFileDTO[] = [];
    displayedColumns = ['title', 'group', 'subject', 'size', 'createdAt', 'actions'];

    ngOnInit(): void {
        this.loadGroups();
    }

    loadGroups() {
        this.api.myGroups().subscribe({
            next: gs => this.groups = gs || [],
            error: () => this.groups = []
        });
    }

    onGroupChange() {
        this.selectedSubject = null;
        this.subjects = [];
        if (this.selectedGroup) {
            this.api.subjectsForGroup(this.selectedGroup).subscribe({
                next: subs => this.subjects = subs || [],
            });
        }
        this.reload();
    }

    reload(): void {
        this.loading.set(true);
        this.api.list(this.trainerId, this.selectedGroup || undefined).subscribe({
            next: (rows) => this.rows = rows || [],
            error: () => this.rows = [],
            complete: () => this.loading.set(false),
        });
    }

    async pickAndUpload() {
        if (!this.selectedGroup || !this.selectedSubject) {
            Swal.fire('Missing info', 'Please select a group and a subject first.', 'warning');
            return;
        }
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/pdf';
        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;
            if (file.type !== 'application/pdf') {
                Swal.fire('Invalid file', 'Only PDF files are allowed.', 'warning');
                return;
            }
            this.loading.set(true);
            this.api.upload(file, this.trainerId, this.selectedGroup!, this.selectedSubject!).subscribe({
                next: () => {
                    Swal.fire('Uploaded', 'Course uploaded successfully.', 'success');
                    this.reload();
                },
                error: (e) => {
                    const msg = typeof e?.error === 'string' ? e.error : 'Upload failed.';
                    Swal.fire('Error', msg, 'error');
                },
                complete: () => this.loading.set(false),
            });
        };
        input.click();
    }

    download(row: CourseFileDTO) {
        this.api.presignedDownload(row.id, this.trainerId, 60).subscribe({
            next: (url) => window.open(url, '_blank'),
            error: () => Swal.fire('Error', 'Failed to get download link.', 'error'),
        });
    }

    delete(row: CourseFileDTO) {
        Swal.fire({
            icon: 'warning',
            title: 'Delete this course?',
            text: `${row.title} — ${row.groupeName} / ${row.subject}`,
            showCancelButton: true,
            confirmButtonText: 'Delete',
        }).then((r) => {
            if (!r.isConfirmed) return;
            this.api.delete(row.id, this.trainerId).subscribe({
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
        if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
        return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
}
