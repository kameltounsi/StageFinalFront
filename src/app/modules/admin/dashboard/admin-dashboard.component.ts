import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { UserService } from '../../../layout/common/user/user.service';

type Overview = {
    students: { total: number; unassigned: number; newThisMonth: number };
    groups: { total: number; lowCapacity: number };
    claims: { pending: number };
    promotionReadyGroups: number;
};

type GroupRow = {
    id: number;
    name: string;
    specialite: string;
    level: 'A' | 'B' | null;
    studentCount: number;
    studentCapacityLeft: number;
    trainerCapacityLeft: number;
    pendingClaims: number;
    gradingComplete: boolean;
    admittedCount: number;
    rejectedCount: number;
    incompleteCount: number;
};

// Team tab
type TrainerGroupRef = { id: number; name: string };
type TrainerRow = {
    id: number;
    fullName: string;
    email: string;
    profilePicture?: string;
    groups: TrainerGroupRef[];
};
type TrainersBySpecialite = {
    specialite: string;
    trainers: TrainerRow[];
};

// Students by Speciality chart
type SpecialiteCount = { specialite: string; count: number };

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatTabsModule,
        MatMenuModule,
        MatChipsModule,
        MatTooltipModule,
        MatProgressBarModule,
    ],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    loading = true;
    refreshing = false;
    errorMsg: string | null = null;

    overview: Overview | null = null;
    groups: GroupRow[] = [];

    // Team tab data
    trainersBySpec: TrainersBySpecialite[] = [];

    // Students by Speciality chart
    specCounts: SpecialiteCount[] = [];
    maxSpecCount = 1;

    adminName = 'Admin';

    constructor(
        private http: HttpClient,
        private cdr: ChangeDetectorRef,
        protected userSvc: UserService
    ) {}

    ngOnInit(): void {
        const u = this.userSvc.current;
        if (u?.fullName) this.adminName = u.fullName;
        this.userSvc.user$.pipe(takeUntil(this.destroy$)).subscribe((usr) => {
            if (usr?.fullName) {
                this.adminName = usr.fullName;
                this.cdr.markForCheck();
            }
        });

        this.loadAll();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private _prepareSpecCounts(specCounts?: SpecialiteCount[]) {
        const list = (specCounts ?? []).slice().sort((a, b) => b.count - a.count);
        this.specCounts = list;
        this.maxSpecCount = Math.max(1, ...list.map((s) => s.count));
    }

    loadAll(): void {
        this.loading = true;
        this.errorMsg = null;

        forkJoin({
            overview: this.http.get<Overview>('/api/admin/overview'),
            groups: this.http.get<GroupRow[]>('/api/admin/groups/status'),
            trainers: this.http.get<TrainersBySpecialite[]>('/api/admin/trainers/by-specialite'),
            specCounts: this.http.get<SpecialiteCount[]>('/api/admin/stats/students-by-specialite'),
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: ({ overview, groups, trainers, specCounts }) => {
                    this.overview = overview;
                    this.groups = groups;
                    this.trainersBySpec = trainers ?? [];
                    this._prepareSpecCounts(specCounts);
                    this.loading = false;
                    this.cdr.markForCheck();
                },
                error: (err) => {
                    this.errorMsg =
                        err?.error?.message ?? 'Could not load dashboard data. Please try again.';
                    this.loading = false;
                    this.cdr.markForCheck();
                },
            });
    }

    refresh(): void {
        if (this.refreshing) return;
        this.refreshing = true;

        forkJoin({
            overview: this.http.get<Overview>('/api/admin/overview'),
            groups: this.http.get<GroupRow[]>('/api/admin/groups/status'),
            trainers: this.http.get<TrainersBySpecialite[]>('/api/admin/trainers/by-specialite'),
            specCounts: this.http.get<SpecialiteCount[]>('/api/admin/stats/students-by-specialite'),
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: ({ overview, groups, trainers, specCounts }) => {
                    this.overview = overview;
                    this.groups = groups;
                    this.trainersBySpec = trainers ?? [];
                    this._prepareSpecCounts(specCounts);
                    this.refreshing = false;
                    this.cdr.markForCheck();
                },
                error: () => {
                    this.refreshing = false;
                    this.cdr.markForCheck();
                },
            });
    }

    // UI helpers
    kpiColor(kind: 'blue' | 'red' | 'amber' | 'green'): string {
        return { blue: 'kpi-blue', red: 'kpi-red', amber: 'kpi-amber', green: 'kpi-green' }[kind];
    }

    trackById(_: number, r: GroupRow) {
        return r.id;
    }

    protected readonly Math = Math;
}
