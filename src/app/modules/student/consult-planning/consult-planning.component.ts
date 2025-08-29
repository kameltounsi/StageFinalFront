// app/modules/student/consult-planning/consult-planning.component.ts
import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConsultPlanningService, WeeklyItem } from './consult-planning.services';

type Slot = { start: string; end: string; label: string };

const SLOTS: Slot[] = [
    { start: '08:00', end: '10:00', label: '08:00 – 10:00' },
    { start: '10:00', end: '12:00', label: '10:00 – 12:00' },
    { start: '13:00', end: '15:00', label: '13:00 – 15:00' },
    { start: '15:00', end: '17:00', label: '15:00 – 17:00' },
];

@Component({
    selector: 'app-consult-planning',
    standalone: true,
    templateUrl: './consult-planning.component.html',
    styleUrls: ['./consult-planning.component.css'],
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatInputModule,
    ],
})
export class ConsultPlanningComponent implements OnInit {

    // UI state
    selectedDate = signal<Date>(new Date());
    loading = signal(false);
    error = signal<string | null>(null);
    downloading = signal(false);

    // Table data
    days = signal<Date[]>([]);
    grid = signal<WeeklyItem[][]>([]);

    weekLabel = computed(() => {
        const { start, end } = this.weekRange(this.selectedDate());
        const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        return `Week of ${fmt(start)} to ${fmt(end)}`;
    });

    constructor(private svc: ConsultPlanningService) {}

    ngOnInit(): void {
        this.refresh();
    }

    prevWeek(): void {
        const d = new Date(this.selectedDate());
        d.setDate(d.getDate() - 7);
        this.selectedDate.set(d);
        this.refresh();
    }

    nextWeek(): void {
        const d = new Date(this.selectedDate());
        d.setDate(d.getDate() + 7);
        this.selectedDate.set(d);
        this.refresh();
    }

    onDatePicked(d: Date | null): void {
        if (!d) return;
        const only = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        this.selectedDate.set(only);
        this.refresh();
    }

    downloadPdf(): void {
        if (this.downloading()) return;
        this.downloading.set(true);

        const { start, end } = this.weekRange(this.selectedDate());
        const startYmd = this.toYmd(start);
        const endYmd = this.toYmd(end);

        this.svc.downloadMyWeekPdf(startYmd, endYmd).subscribe({
            next: (blob: Blob) => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `student_weekly_schedule_${startYmd}_to_${endYmd}.pdf`;
                a.click();
                URL.revokeObjectURL(a.href);
                this.downloading.set(false);
            },
            error: () => {
                this.error.set('Failed to export PDF.');
                this.downloading.set(false);
            },
        });
    }

    private refresh(): void {
        this.loading.set(true);
        this.error.set(null);

        const { start, end } = this.weekRange(this.selectedDate());
        const startYmd = this.toYmd(start);
        const endYmd = this.toYmd(end);

        // Build columns
        const days: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const dd = new Date(start);
            dd.setDate(start.getDate() + i);
            days.push(dd);
        }
        this.days.set(days);

        this.svc.getMyWeek(startYmd, endYmd).subscribe({
            next: (items) => {
                this.grid.set(this.buildGrid(days, items));
                this.loading.set(false);
            },
            error: (err) => {
                const msg = err?.error?.message || 'Authentication required or session expired.';
                this.error.set(msg);
                this.loading.set(false);
            },
        });
    }

    private weekRange(d: Date): { start: Date; end: Date } {
        const dow = d.getDay(); // 0=Sun..6=Sat
        const mon = new Date(d);
        mon.setDate(d.getDate() - ((dow + 6) % 7));
        mon.setHours(0, 0, 0, 0);
        const sun = new Date(mon);
        sun.setDate(mon.getDate() + 6);
        sun.setHours(0, 0, 0, 0);
        return { start: mon, end: sun };
    }

    private toYmd(d: Date): string {
        const p = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    }

    private buildGrid(days: Date[], items: WeeklyItem[]): WeeklyItem[][] {
        const grid: WeeklyItem[][] = Array.from({ length: 7 * SLOTS.length }, () => []);
        const key = (di: number, si: number) => di * SLOTS.length + si;
        const overlaps = (aS: string, aE: string, bS: string, bE: string) => aS < bE && aE > bS;

        const dayIndexByYmd = new Map<string, number>();
        days.forEach((d, i) => dayIndexByYmd.set(this.toYmd(d), i));

        for (const it of items ?? []) {
            const di = dayIndexByYmd.get(it.date);
            if (di == null) continue;
            SLOTS.forEach((slot, si) => {
                if (overlaps(it.heureDebut, it.heureFin, slot.start, slot.end)) {
                    grid[key(di, si)].push(it);
                }
            });
        }
        return grid;
    }

    dayHeader(d: Date): string {
        const w = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
        return `${w} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    }

    slotLabel(i: number): string {
        return SLOTS[i].label;
    }

    slotCount(): number {
        return SLOTS.length;
    }

    cellItems(di: number, si: number): WeeklyItem[] {
        return this.grid()[di * this.slotCount() + si] ?? [];
    }

// app/modules/student/consult-planning/consult-planning.component.ts
    trainerName(it: WeeklyItem): string {
        return it.formateurNom || '—';
    }

}
