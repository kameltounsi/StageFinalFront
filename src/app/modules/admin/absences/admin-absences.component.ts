// src/app/modules/admin/absences/admin-absences.component.ts
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import {
    AdminAbsencesService,
    Group,
    SummaryRow,
    DetailItem
} from './admin-absences.service';

@Component({
    selector: 'app-admin-absences',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatCardModule, MatFormFieldModule, MatSelectModule, MatInputModule,
        MatIconModule, MatButtonModule
    ],
    templateUrl: './admin-absences.component.html',
    styleUrls: ['./admin-absences.component.css']
})
export class AdminAbsencesComponent implements OnInit {
    // --- Filters
    specialites: string[] = [];
    groups: Group[] = [];

    selectedSpecialite?: string;
    selectedGroupId?: number;

    start?: string;
    end?: string;

    sortBy: 'total' | 'unjustified' | 'name' = 'total';
    dir: 'asc' | 'desc' = 'desc';

    // --- Data
    rows: SummaryRow[] = [];
    loading = false;

    // --- Details drawer
    detailsFor?: SummaryRow;
    details: DetailItem[] = [];
    loadingDetails = false;

    // --- debounce timer
    private searchTimer?: any;
    private readonly DEBOUNCE_MS = 300;

    // --- Alert threshold
    alertThreshold = 5;
    sendingOne = new Set<number>();  // studentIds currently sending
    sendingBulk = false;

    constructor(private api: AdminAbsencesService) {}

    ngOnInit(): void {
        this.api.specialites().subscribe(list => this.specialites = list || []);
    }

    // Triggered when speciality changes
    onSpecialiteChange(): void {
        this.selectedGroupId = undefined;
        this.groups = [];

        if (!this.selectedSpecialite) {
            this.rows = [];
            return;
        }

        // Load groups for selected speciality, then refresh summary
        this.api.groups(this.selectedSpecialite).subscribe(gs => {
            this.groups = gs || [];
            this.scheduleSearch(); // auto-refresh after groups are loaded
        });
    }

    // Triggered when group changes
    onGroupChange(): void {
        this.scheduleSearch();
    }

    // Triggered when dates change
    onDatesChange(): void {
        this.scheduleSearch();
    }

    // Sorting keeps calling the API
    toggleSort(col: 'total' | 'unjustified' | 'name'): void {
        if (this.sortBy === col) {
            this.dir = this.dir === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = col;
            this.dir = col === 'name' ? 'asc' : 'desc';
        }
        this.search();
    }

    // Open student details
    openDetails(row: SummaryRow): void {
        this.detailsFor = row;
        this.loadingDetails = true;
        this.details = [];

        this.api.details(row.studentId, {
            specialite: this.selectedSpecialite,
            groupId: this.selectedGroupId,
            start: this.start, end: this.end
        }).subscribe({
            next: list => { this.details = list || []; this.loadingDetails = false; },
            error: () => { this.loadingDetails = false; }
        });
    }

    closeDetails(): void {
        this.detailsFor = undefined;
        this.details = [];
    }

    // ------------- NEW: Alerts -------------

    canAlert(r: SummaryRow): boolean {
        return (r.unjustifiedAbsences ?? 0) > this.alertThreshold;
    }

    sendAlert(r: SummaryRow): void {
        if (!this.canAlert(r) || this.sendingOne.has(r.studentId)) return;
        this.sendingOne.add(r.studentId);

        this.api.sendAlert(r.studentId, this.alertThreshold).subscribe({
            next: () => {
                this.sendingOne.delete(r.studentId);
                // Option: petit feedback visuel; on rafraîchit juste la liste
                this.search();
                alert(`Alert sent to ${r.studentName}.`);
            },
            error: () => {
                this.sendingOne.delete(r.studentId);
                alert('Failed to send alert.');
            }
        });
    }

    countOverThreshold(): number {
        return (this.rows || []).filter(r => this.canAlert(r)).length;
    }

    sendBulkAlerts(): void {
        if (this.sendingBulk) return;
        this.sendingBulk = true;

        this.api.sendBulkAlert({
            specialite: this.selectedSpecialite,
            groupId: this.selectedGroupId,
            start: this.start, end: this.end,
            minUnjustified: this.alertThreshold
        }).subscribe({
            next: res => {
                this.sendingBulk = false;
                this.search();
                alert(`Bulk alerts sent: ${res?.sent ?? 0}`);
            },
            error: () => {
                this.sendingBulk = false;
                alert('Failed to send bulk alerts.');
            }
        });
    }

    // ---------------- Internal ----------------

    // Debounced search to avoid excessive calls
    private scheduleSearch(): void {
        if (this.searchTimer) clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => this.search(), this.DEBOUNCE_MS);
    }

    private search(): void {
        // If no speciality chosen yet, nothing to show
        if (!this.selectedSpecialite) {
            this.rows = [];
            return;
        }

        this.loading = true;
        this.rows = [];

        this.api.summary({
            specialite: this.selectedSpecialite,
            groupId: this.selectedGroupId,
            start: this.start, end: this.end,
            sortBy: this.sortBy, dir: this.dir
        }).subscribe({
            next: list => { this.rows = list || []; this.loading = false; },
            error: () => { this.loading = false; }
        });
    }
}
