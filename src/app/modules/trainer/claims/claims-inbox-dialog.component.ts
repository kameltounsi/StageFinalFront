// src/app/modules/trainer/claims/claims-inbox-dialog.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TrainerClaimsApi, NoteClaimDTO } from './trainer-claims.api';
import { DecideClaimDialogComponent } from './decide-claim-dialog.component';

@Component({
    selector: 'app-claims-inbox-dialog',
    standalone: true,
    templateUrl: './claims-inbox-dialog.component.html',
    styleUrls: ['./claims-inbox-dialog.component.css'],
    imports: [
        CommonModule, MatDialogModule, MatButtonModule, MatIconModule,
        MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule
    ],
})
export class ClaimsInboxDialogComponent implements OnInit {
    private api = inject(TrainerClaimsApi);
    private dialog = inject(MatDialog);
    ref = inject(MatDialogRef<ClaimsInboxDialogComponent>);

    loading = signal(false);
    rows: NoteClaimDTO[] = [];
    subjects: string[] = [];
    selected = '';

    ngOnInit(): void { this.reload(); }

    reload() {
        this.loading.set(true);
        this.api.inbox().subscribe({
            next: (rows) => {
                this.rows = rows ?? [];
                this.subjects = Array.from(new Set(this.rows.map(r => r.matiere))).sort((a,b)=>a.localeCompare(b));
                if (this.selected && !this.subjects.includes(this.selected)) this.selected = '';
            },
            complete: () => this.loading.set(false),
            error: () => this.loading.set(false),
        });
    }

    get displayed() {
        return this.selected ? this.rows.filter(r => r.matiere === this.selected) : this.rows;
    }

    openApprove(r: NoteClaimDTO) {
        this.dialog.open(DecideClaimDialogComponent, {
            width: '540px',
            data: { mode: 'approve', claim: r }
        }).afterClosed().subscribe(done => { if (done) this.reload(); });
    }

    openReject(r: NoteClaimDTO) {
        this.dialog.open(DecideClaimDialogComponent, {
            width: '540px',
            data: { mode: 'reject', claim: r }
        }).afterClosed().subscribe(done => { if (done) this.reload(); });
    }

    close() { this.ref.close(); }
}
