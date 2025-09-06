// src/app/modules/student-dashboard/student-dashboard.component.ts
import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation,
} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { StudentDashboardApi, StudentOverview, DaySession, GradeRow } from './student-dashboard.api';
import {UserService} from "../../../layout/common/user/user.service";

@Component({
    selector: 'app-student-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule, MatIconModule, MatButtonModule,
        MatChipsModule, MatTooltipModule, MatProgressBarModule,
    ],
    templateUrl: './student-dashboard.component.html',
    styleUrls: ['./student-dashboard.component.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    loading = true;
    refreshing = false;
    errorMsg: string | null = null;

    meName = 'Student';
    overview: StudentOverview | null = null;
    today: DaySession[] = [];
    grades: GradeRow[] = [];

    maxGrade = 20;

    constructor(
        private api: StudentDashboardApi,
        protected userSvc: UserService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        const u = this.userSvc.current;
        if (u?.fullName) this.meName = u.fullName;
        this.userSvc.user$.pipe(takeUntil(this.destroy$)).subscribe(us => {
            if (us?.fullName) { this.meName = us.fullName; this.cdr.markForCheck(); }
        });

        this.loadAll();
    }

    ngOnDestroy(): void {
        this.destroy$.next(); this.destroy$.complete();
    }

    loadAll(): void {
        this.loading = true; this.errorMsg = null;
        forkJoin({
            overview: this.api.overview(),
            today: this.api.today(),
            grades: this.api.grades(),
        }).pipe(takeUntil(this.destroy$)).subscribe({
            next: ({ overview, today, grades }) => {
                this.overview = overview;
                this.today = today ?? [];
                this.grades = grades ?? [];
                this.maxGrade = Math.max(20, ...this.grades.map(g => g.average || 0));
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.errorMsg = err?.error?.message ?? 'Could not load student dashboard.';
                this.loading = false;
                this.cdr.markForCheck();
            }
        });
    }

    refresh(): void {
        if (this.refreshing) return;
        this.refreshing = true;
        forkJoin({
            overview: this.api.overview(),
            today: this.api.today(),
            grades: this.api.grades(),
        }).pipe(takeUntil(this.destroy$)).subscribe({
            next: ({ overview, today, grades }) => {
                this.overview = overview;
                this.today = today ?? [];
                this.grades = grades ?? [];
                this.maxGrade = Math.max(20, ...this.grades.map(g => g.average || 0));
                this.refreshing = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.refreshing = false;
                this.cdr.markForCheck();
            }
        });
    }

    // barre horizontale pour les moyennes
    gradeWidth(avg?: number | null): string {
        if (avg == null) return '0%';
        return `${Math.min(100, Math.max(0, (avg / this.maxGrade) * 100))}%`;
    }
}
