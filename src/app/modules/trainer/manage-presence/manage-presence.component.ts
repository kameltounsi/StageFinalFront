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
import Swal from 'sweetalert2';

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

    private readonly WARN_ON_SWITCH = true;

    mode = signal<Mode>('today');

    monday = signal<string>(this.getMondayISO(new Date()));
    sunday = computed(() => this.addDaysISO(this.monday(), 6));

    historyStart = this.addDaysISO(this.monday(), -28);
    historyEnd   = this.sunday();

    trainerId?: number;

    groups: GroupOption[] = [];
    selectedGroupId?: number;

    allSessions: SessionItem[] = [];
    sessions: SessionItem[] = [];
    selectedSessionId?: number;

    students: Student[] = [];

    /** Trois maps distinctes pour l’édition */
    marksPresent = new Map<number, boolean>();         // id -> present
    marksJustified = new Map<number, boolean>();       // id -> justified (si absent)
    marksNote = new Map<number, string>();             // id -> justification note

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
        if (!this.selectedSessionId || this.students.length === 0) return true;

        const edited = this.students.some(s =>
            this.marksPresent.has(s.id) || this.marksJustified.has(s.id) || this.marksNote.has(s.id)
        );
        if (!edited) return true;

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
        this.marksPresent.clear();
        this.marksJustified.clear();
        this.marksNote.clear();

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
        this.marksPresent.clear();
        this.marksJustified.clear();
        this.marksNote.clear();
    }

    onGroupChange(): void {
        this.applyGroupFilter();
    }

    onSelectSession(): void {
        if (!this.selectedSessionId) {
            this.students = [];
            this.marksPresent.clear();
            this.marksJustified.clear();
            this.marksNote.clear();
            return;
        }

        this.loading = true;
        this.students = [];
        this.marksPresent.clear();
        this.marksJustified.clear();
        this.marksNote.clear();

        const roster$ = this.mode() === 'today'
            ? this.api.getRoster(this.selectedSessionId)
            : this.api.getHistoryRoster(this.selectedSessionId);

        roster$
            .pipe(
                tap(({ students, marks }) => {
                    this.students = students ?? [];
                    // initialisation depuis backend (présent/absent + justification)
                    this.students.forEach(s => {
                        const found = marks.find(m => m.studentId === s.id);
                        const present = found ? !!found.present : false;
                        this.marksPresent.set(s.id, present);
                        if (!present) {
                            if (found?.justified !== undefined) this.marksJustified.set(s.id, !!found.justified);
                            if (found?.justificationNote) this.marksNote.set(s.id, found.justificationNote);
                        }
                    });
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
        for (const s of this.students) {
            this.marksPresent.set(s.id, value);
            if (value) {
                // remettre justification à neutre si on vient de marquer Present
                this.marksJustified.delete(s.id);
                this.marksNote.delete(s.id);
            }
        }
    }

    togglePresent(studentId: number, present: boolean): void {
        this.marksPresent.set(studentId, present);
        if (present) {
            // si on passe à Present, on efface justification
            this.marksJustified.delete(studentId);
            this.marksNote.delete(studentId);
        }
    }

    toggleJustified(studentId: number, justified: boolean): void {
        this.marksJustified.set(studentId, justified);
    }

    onNoteChange(studentId: number, note: string): void {
        this.marksNote.set(studentId, note);
    }

    save(): void {
        if (!this.selectedSessionId) return;

        const payload: AttendanceMark[] = this.students.map(s => {
            const present = !!this.marksPresent.get(s.id);
            return {
                studentId: s.id,
                present,
                justified: present ? false : !!this.marksJustified.get(s.id),
                justificationNote: present ? undefined : (this.marksNote.get(s.id) || undefined)
            };
        });

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
        const day = d.getDay() || 7;
        if (day !== 1) d.setDate(d.getDate() - (day - 1));
        return this.fmtLocalYYYYMMDD(d);
    }
    addDaysISO(iso: string, days: number): string {
        const d = new Date(iso + 'T00:00:00');
        d.setDate(d.getDate() + days);
        return this.fmtLocalYYYYMMDD(d);
    }
}
