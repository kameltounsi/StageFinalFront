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

import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';

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

    // navigation semaine
    monday = signal<string>(this.getMondayISO(new Date()));
    sunday = computed(() => this.addDaysISO(this.monday(), 6));

    // formateur courant
    trainerId?: number;

    // données
    sessions: SessionItem[] = [];
    selectedSessionId?: number;

    students: Student[] = [];
    marks = new Map<number, boolean>(); // studentId -> present

    // UI
    loading = false;
    saving = false;
    filter = '';

    constructor(private api: ManagePresenceService) {}

    ngOnInit(): void {
        this.api.me().subscribe(me => {
            this.trainerId = me?.id;
            this.loadWeek();
        });
    }

    // ---- Loaders

    loadWeek(): void {
        if (!this.trainerId) return;
        this.loading = true;
        this.selectedSessionId = undefined;
        this.sessions = [];
        this.students = [];
        this.marks.clear();

        this.api.sessionsByTrainerAndWeek(this.trainerId, this.monday(), this.sunday())
            .pipe(catchError(() => of<SessionItem[]>([])))
            .subscribe(list => {
                this.sessions = list;
                this.loading = false;

                // UX: auto-sélection si une seule séance
                if (this.sessions.length === 1) {
                    this.selectedSessionId = this.sessions[0].id;
                    this.onSelectSession();
                }
            });
    }

    onSelectSession(): void {
        if (!this.selectedSessionId) return;
        const session = this.sessions.find(s => s.id === this.selectedSessionId);
        if (!session) return;

        this.loading = true;
        this.students = [];
        this.marks.clear();

        this.api.studentsByGroupe(session.groupe.id).pipe(
            switchMap(studs => {
                this.students = studs ?? [];
                // par défaut: absent
                this.students.forEach(s => this.marks.set(s.id, false));
                return forkJoin({
                    existing: this.api.getAttendance(session.id).pipe(catchError(() => of<AttendanceMark[]>([])))
                });
            }),
            tap(({ existing }) => {
                existing.forEach(m => this.marks.set(m.studentId, !!m.present));
            }),
            catchError(() => of(null))
        ).subscribe({
            next: () => this.loading = false,
            error: () => this.loading = false
        });
    }

    // ---- Actions

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
        this.api.saveAttendance(this.selectedSessionId, payload).subscribe({
            next: () => {
                this.saving = false;
                alert('✅ Présences enregistrées');
            },
            error: () => {
                this.saving = false;
                alert('❌ Erreur lors de la sauvegarde');
            }
        });
    }

    // ---- Helpers

    filteredStudents() {
        const q = this.filter.trim().toLowerCase();
        if (!q) return this.students;
        return this.students.filter(s =>
            s.fullName?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)
        );
    }

    // label robuste (évite les "•" orphelins)
    sessionLabel(s: SessionItem): string {
        const time = [s.heureDebut, s.heureFin].filter(Boolean).join('–') || '--:--';
        const mat = s.matiere || s.groupe?.specialite || '';
        const grp = s.groupe?.nom || '';
        return `${s.date} • ${time} • ${mat} • ${grp}`.replace(/\s+•\s*$/, '');
    }

    // ---- trackBy (performances)
    trackBySession = (_: number, s: SessionItem) => s.id;
    trackByStudent = (_: number, s: Student) => s.id;

    // ---- Dates (corrigées: pas de toISOString() -> évite le décalage UTC)
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
        const d = new Date(iso + 'T00:00:00'); // force locale
        d.setDate(d.getDate() + days);
        return this.fmtLocalYYYYMMDD(d);
    }

    prevWeek() { this.monday.set(this.addDaysISO(this.monday(), -7)); this.loadWeek(); }
    nextWeek() { this.monday.set(this.addDaysISO(this.monday(), 7)); this.loadWeek(); }
}
