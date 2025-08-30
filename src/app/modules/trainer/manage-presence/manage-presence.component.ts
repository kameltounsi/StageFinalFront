import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import {
    AttendanceMark,
    ManagePresenceService,
    SessionItem,
    Student
} from './manage-presence.service';

import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import Swal from 'sweetalert2'; // ✅ SweetAlert2

type Mode = 'today' | 'history';

interface GroupOption {
    id: number;
    name: string;
}

@Component({
    selector: 'app-manage-presence',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatCardModule, MatSelectModule, MatFormFieldModule, MatInputModule,
        MatButtonModule, MatIconModule, MatSlideToggleModule
    ],
    templateUrl: './manage-presence.component.html',
    styleUrls: ['./manage-presence.component.css']
})
export class ManagePresenceComponent implements OnInit {

    // ===== Config =====
    private readonly WARN_ON_SWITCH = true; // set false to skip confirmation

    // ===== Mode (Signals must be read with mode()) =====
    mode = signal<Mode>('today');

    // ===== Week labels (kept) =====
    monday = signal<string>(this.getMondayISO(new Date()));
    sunday = computed(() => this.addDaysISO(this.monday(), 6));

    // ===== History range =====
    historyStart = this.addDaysISO(this.monday(), -28);
    historyEnd   = this.sunday();

    // ===== Current trainer =====
    trainerId?: number;

    // ===== Class & session =====
    groups: GroupOption[] = [];
    selectedGroupId?: number;

    allSessions: SessionItem[] = [];
    sessions: SessionItem[] = [];
    selectedSessionId?: number;

    // ===== Roster =====
    students: Student[] = [];
    marks = new Map<number, boolean>();

    // ===== UI =====
    loading = false;
    saving  = false;
    filter  = '';

    constructor(private api: ManagePresenceService) {}

    ngOnInit(): void {
        this.api.me().subscribe({
            next: (me) => {
                this.trainerId = me?.id;
                this.hardReset('today');
                this.load();
            },
            error: () => this.toast('Could not load your profile.', 'error')
        });
    }

    // ---------- SweetAlert helpers ----------
    private toast(title: string, icon: 'success' | 'error' | 'warning' | 'info') {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon,
            title,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }

    private async confirmDiscard(): Promise<boolean> {
        if (!this.WARN_ON_SWITCH) return true;

        // Detect if there is anything to save (selected session and at least one toggle differs)
        if (!this.selectedSessionId || this.students.length === 0) return true;

        // There’s no pristine snapshot, so use presence of any 'true' OR 'false' as edited state.
        // If you want stricter detection, keep a snapshot after load and compare.
        const hasAny = this.students.some(s => this.marks.has(s.id));
        if (!hasAny) return true;

        const res = await Swal.fire({
            title: 'Discard changes?',
            text: 'You have unsaved changes. Switching will discard them.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Discard',
            cancelButtonText: 'Stay',
            reverseButtons: true
        });
        return res.isConfirmed;
    }

    // ----------------- RESET HELPERS -----------------
    private resetVisualState(): void {
        this.selectedGroupId = undefined;
        this.selectedSessionId = undefined;

        this.groups = [];
        this.allSessions = [];
        this.sessions = [];

        this.students = [];
        this.marks.clear();

        this.filter = '';
        this.loading = false;
        this.saving  = false;
    }

    private hardReset(nextMode: Mode): void {
        this.resetVisualState();
        if (nextMode === 'history') {
            const todayISO = this.getMondayISO(new Date());
            this.historyEnd = this.addDaysISO(todayISO, 6);
            this.historyStart = this.addDaysISO(this.historyEnd, -28);
        } else {
            this.monday.set(this.getMondayISO(new Date()));
            // sunday() is computed
        }
    }

    // ----------------- LOADERS -----------------
    load(): void {
        if (!this.trainerId) return;

        this.resetVisualState();
        this.loading = true;

        const obs = this.mode() === 'today'
            ? this.api.sessionsByTrainerAndWeek(this.trainerId!, this.monday(), this.sunday())
            : this.api.historySessions(this.historyStart, this.historyEnd);

        obs.pipe(catchError(() => of<SessionItem[]>([])))
            .subscribe({
                next: (list) => {
                    this.allSessions = list ?? [];
                    this.groups = this.buildGroupOptions(this.allSessions);
                    this.applyGroupFilter();
                    this.loading = false;

                    if (this.allSessions.length === 0) {
                        this.toast('No sessions found for the selected period.', 'info');
                    }
                },
                error: () => {
                    this.loading = false;
                    this.toast('Failed to load sessions.', 'error');
                }
            });
    }

    private buildGroupOptions(items: SessionItem[]): GroupOption[] {
        const seen = new Map<number, string>();
        for (const s of items) {
            const id = s.groupe?.id;
            const name = s.groupe?.nom;
            if (id && name && !seen.has(id)) seen.set(id, name);
        }
        return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
    }

    private applyGroupFilter(): void {
        if (this.selectedGroupId) {
            this.sessions = this.allSessions.filter(s => s.groupe?.id === this.selectedGroupId);
        } else {
            this.sessions = [];
        }
        this.selectedSessionId = undefined;
        this.students = [];
        this.marks.clear();
    }

    onGroupChange(): void {
        this.applyGroupFilter();
    }

    onSelectSession(): void {
        if (!this.selectedSessionId) {
            this.students = [];
            this.marks.clear();
            return;
        }

        this.loading = true;
        this.students = [];
        this.marks.clear();

        const roster$ = this.mode() === 'today'
            ? this.api.getRoster(this.selectedSessionId)
            : this.api.getHistoryRoster(this.selectedSessionId);

        roster$
            .pipe(
                tap(({ students, marks }) => {
                    this.students = students ?? [];
                    this.students.forEach(s => this.marks.set(s.id, false));
                    marks.forEach(m => this.marks.set(m.studentId, !!m.present));
                }),
                catchError(() => {
                    this.toast('Failed to load roster.', 'error');
                    return of(null);
                })
            )
            .subscribe({
                next: () => this.loading = false,
                error: () => this.loading = false
            });
    }

    // ----------------- ACTIONS -----------------
    setAll(value: boolean): void {
        for (const s of this.students) this.marks.set(s.id, value);
    }

    toggle(studentId: number, checked: boolean): void {
        this.marks.set(studentId, checked);
    }

    save(): void {
        if (!this.selectedSessionId) return;

        const payload: AttendanceMark[] = this.students.map(s => ({
            studentId: s.id,
            present: !!this.marks.get(s.id)
        }));

        this.saving = true;

        const save$ = this.mode() === 'today'
            ? this.api.saveAttendance(this.selectedSessionId, payload)
            : this.api.saveHistoryAttendance(this.selectedSessionId, payload);

        save$.subscribe({
            next: () => {
                this.saving = false;
                this.toast('Attendance saved successfully.', 'success');
            },
            error: () => {
                this.saving = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Save failed',
                    text: 'An error occurred while saving attendance. Please try again.'
                });
            }
        });
    }

    // ----------------- MODE SWITCH -----------------
    async setMode(m: Mode) {
        if (this.mode() === m) return;
        const ok = await this.confirmDiscard();
        if (!ok) return;

        this.mode.set(m);
        this.hardReset(m);
        this.load();
    }

    // ----------------- Helpers & trackBy -----------------
    filteredStudents() {
        const q = this.filter.trim().toLowerCase();
        if (!q) return this.students;
        return this.students.filter(s =>
            s.fullName?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)
        );
    }

    sessionLabel(s: SessionItem): string {
        const time = [s.heureDebut, s.heureFin].filter(Boolean).join('–') || '--:--';
        const mat  = s.matiere || s.groupe?.specialite || '';
        const grp  = s.groupe?.nom || '';
        return `${s.date} • ${time} • ${mat} • ${grp}`.replace(/\s+•\s*$/, '');
    }

    trackBySession = (_: number, s: SessionItem) => s.id;
    trackByStudent = (_: number, s: Student) => s.id;

    private fmtLocalYYYYMMDD(d: Date): string {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }
    getMondayISO(d: Date): string {
        const day = d.getDay() || 7; // Mon=1..Sun=7
        if (day !== 1) d.setDate(d.getDate() - (day - 1));
        return this.fmtLocalYYYYMMDD(d);
    }
    addDaysISO(iso: string, days: number): string {
        const d = new Date(iso + 'T00:00:00');
        d.setDate(d.getDate() + days);
        return this.fmtLocalYYYYMMDD(d);
    }
}
