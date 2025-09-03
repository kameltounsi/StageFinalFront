// src/app/modules/student/notes/student-notes.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StudentNotesApi, StudentNoteDTO, NoteClaimDTO } from './student-notes.api';
import Swal from 'sweetalert2';
import { StudentClaimDetailsDialogComponent } from './student-claim-details-dialog.component';

@Component({
    selector: 'app-student-notes',
    standalone: true,
    templateUrl: './student-notes.component.html',
    styleUrls: ['./student-notes.component.css'],
    imports: [
        CommonModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule
    ],
})
export class StudentNotesComponent implements OnInit {
    private api = inject(StudentNotesApi);
    private dialog = inject(MatDialog);

    loading = signal(false);

    rows: StudentNoteDTO[] = [];
    matieres: string[] = [];
    selectedMatiere: string = '';

    /** Dernière réclamation (la plus récente) par matière */
    claims: Record<string, NoteClaimDTO | undefined> = {};

    ngOnInit(): void {
        this.reload();
    }

    reload(): void {
        this.loading.set(true);
        this.api.getMyNotes().subscribe({
            next: (rows) => {
                this.rows = Array.isArray(rows) ? rows : [];
                this.matieres = Array.from(new Set(this.rows.map(r => (r.matiere || '').trim())))
                    .sort((a, b) => a.localeCompare(b));
                if (this.selectedMatiere && !this.matieres.includes(this.selectedMatiere)) {
                    this.selectedMatiere = '';
                }

                // Charger les réclamations
                this.api.getMyClaims().subscribe({
                    next: (cs) => {
                        this.claims = {};
                        (cs || []).forEach(c => {
                            const key = (c.matiere || '').trim();
                            const prev = this.claims[key];
                            if (!prev || new Date(c.updatedAt) > new Date(prev.updatedAt)) {
                                this.claims[key] = c;
                            }
                        });
                    },
                    complete: () => this.loading.set(false),
                    error: () => this.loading.set(false),
                });
            },
            error: () => { this.rows = []; this.matieres = []; this.loading.set(false); },
        });
    }

    trackByMatiere = (_: number, r: StudentNoteDTO) => (r.matiere || '').trim();

    gradeClass(v: number | null | undefined): string {
        if (v == null) return '';
        if (v < 10)  return 'sn-grade-low';
        if (v < 14)  return 'sn-grade-mid';
        return 'sn-grade-good';
    }

    get displayedRows(): StudentNoteDTO[] {
        if (!this.selectedMatiere) return this.rows;
        return this.rows.filter(r => (r.matiere || '').trim() === this.selectedMatiere);
    }

    claimBadgeText(matiere: string): string | null {
        const c = this.claims[(matiere || '').trim()];
        if (!c) return null;
        if (c.status === 'PENDING') return 'Claim pending';
        if (c.status === 'APPROVED') return 'Claim approved';
        if (c.status === 'REJECTED') return 'Claim rejected';
        return null;
    }

    isClaimPending(matiere: string): boolean {
        const c = this.claims[(matiere || '').trim()];
        return !!c && c.status === 'PENDING';
    }

    hasAnyClaim(matiere: string): boolean {
        return !!this.claims[(matiere || '').trim()];
    }

    openClaimDetails(matiere: string) {
        const c = this.claims[(matiere || '').trim()];
        if (!c) return;
        this.dialog.open(StudentClaimDetailsDialogComponent, {
            width: '560px',
            data: { claim: c }
        });
    }

    /** Ouvre un formulaire SweetAlert pour soumettre une réclamation */
    async requestReview(r: StudentNoteDTO) {
        const { value: msg } = await Swal.fire({
            title: `Request review — ${r.matiere}`,
            input: 'textarea',
            inputLabel: 'Message to your tutor',
            inputPlaceholder: 'Explain why you think the grade should be reviewed',
            inputAttributes: { 'aria-label': 'Message to your tutor' },
            inputValidator: (value) => {
                if (!value || !value.trim()) return 'Message is required.';
                if (value.trim().length < 10) return 'Please provide more details (min 10 characters).';
                return null;
            },
            confirmButtonText: 'Send request',
            cancelButtonText: 'Cancel',
            showCancelButton: true,
            focusConfirm: true,
        });

        if (!msg) return;

        try {
            await this.api.submitClaim({
                matiere: (r.matiere || '').trim(),
                message: msg.trim(),
            }).toPromise();

            Swal.fire('Request sent', 'Your review request has been submitted to your tutor.', 'success');
            this.reload();
        } catch {
            Swal.fire('Error', 'Failed to submit your request. Please try again.', 'error');
        }
    }
}
