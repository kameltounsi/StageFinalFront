// src/app/modules/trainer-dashboard/trainer-dashboard.component.ts
import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { TrainerDashboardApi, TrainerGroupRow, StudentMini, TrainerOverview } from './trainer-dashboard.api';
import {UserService} from "../../../layout/common/user/user.service";

@Component({
    selector: 'app-trainer-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatChipsModule,
        MatTabsModule,
        MatMenuModule,
        MatTooltipModule,
        MatProgressBarModule,
    ],
    templateUrl: './trainer-dashboard.component.html',
    styleUrls: ['./trainer-dashboard.component.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainerDashboardComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    loading = true;
    refreshing = false;
    errorMsg: string | null = null;

    meName = 'Trainer';
    overview: TrainerOverview | null = null;
    groups: TrainerGroupRow[] = [];
    // roster cache
    roster: Record<number, StudentMini[] | undefined> = {};

    // “Students per group” bar helper
    maxStudentsInMyGroups = 1;

    constructor(
        private api: TrainerDashboardApi,
        private cdr: ChangeDetectorRef,
        public userSvc: UserService
    ) {}

    ngOnInit(): void {
        const u = this.userSvc.current;
        if (u?.fullName) this.meName = u.fullName;
        this.userSvc.user$.pipe(takeUntil(this.destroy$)).subscribe((usr) => {
            if (usr?.fullName) {
                this.meName = usr.fullName;
                this.cdr.markForCheck();
            }
        });

        this.loadAll();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadAll(): void {
        this.loading = true;
        this.errorMsg = null;

        forkJoin({
            overview: this.api.overview(),
            groups: this.api.groups(),
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: ({ overview, groups }) => {
                    this.overview = overview;
                    this.groups = groups;
                    this.maxStudentsInMyGroups = Math.max(1, ...groups.map((g) => g.studentCount));
                    this.loading = false;
                    this.cdr.markForCheck();
                },
                error: (err) => {
                    this.errorMsg = err?.error?.message ?? 'Could not load trainer dashboard.';
                    this.loading = false;
                    this.cdr.markForCheck();
                },
            });
    }

    refresh(): void {
        if (this.refreshing) return;
        this.refreshing = true;
        forkJoin({
            overview: this.api.overview(),
            groups: this.api.groups(),
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: ({ overview, groups }) => {
                    this.overview = overview;
                    this.groups = groups;
                    this.maxStudentsInMyGroups = Math.max(1, ...groups.map((g) => g.studentCount));
                    this.refreshing = false;
                    this.cdr.markForCheck();
                },
                error: () => {
                    this.refreshing = false;
                    this.cdr.markForCheck();
                },
            });
    }

    toggleRoster(group: TrainerGroupRow) {
        if (this.roster[group.id] !== undefined) {
            // collapse
            this.roster[group.id] = undefined;
            this.cdr.markForCheck();
            return;
        }
        this.api.students(group.id).subscribe((list) => {
            this.roster[group.id] = list;
            this.cdr.markForCheck();
        });
    }

    kpiColor(kind: 'blue' | 'green' | 'amber' | 'red'): string {
        return { blue: 'kpi-blue', green: 'kpi-green', amber: 'kpi-amber', red: 'kpi-red' }[kind];
    }

    trackById(_: number, g: TrainerGroupRow) {
        return g.id;
    }
}
