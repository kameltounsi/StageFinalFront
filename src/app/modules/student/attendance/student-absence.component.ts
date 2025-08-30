// src/app/modules/student/attendance/student-absence.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { StudentAbsenceItem, StudentAbsenceService, AbsenceStats } from './student-absence.service';

@Component({
    selector: 'app-student-absence',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatCardModule, MatButtonModule, MatIconModule,
        MatFormFieldModule, MatInputModule
    ],
    templateUrl: './student-absence.component.html',
    styleUrls: ['./student-absence.component.css']
})
export class StudentAbsenceComponent implements OnInit {
    from?: string;
    to?: string;
    q = '';

    rows: StudentAbsenceItem[] = [];
    stats: AbsenceStats = { total: 0, justified: 0, unjustified: 0 };
    loading = false;

    constructor(private api: StudentAbsenceService) {}

    ngOnInit(): void { this.search(); }

    search(): void {
        this.loading = true;
        this.api.list(this.from, this.to).subscribe({
            next: ({ rows, stats }) => {
                this.rows = rows || [];
                this.stats = stats || { total: 0, justified: 0, unjustified: 0 };
                this.loading = false;
            },
            error: () => {
                this.rows = [];
                this.stats = { total: 0, justified: 0, unjustified: 0 };
                this.loading = false;
            }
        });
    }

    filtered(): StudentAbsenceItem[] {
        const k = (this.q || '').trim().toLowerCase();
        if (!k) return this.rows;
        return this.rows.filter(r =>
            (r.course || '').toLowerCase().includes(k) ||
            (r.group  || '').toLowerCase().includes(k) ||
            (r.room   || '').toLowerCase().includes(k) ||
            (r.reason || '').toLowerCase().includes(k)
        );
    }

    trackById = (_: number, r: StudentAbsenceItem) => r.id;
}
