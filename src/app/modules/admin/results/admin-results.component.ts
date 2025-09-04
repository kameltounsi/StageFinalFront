import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

import { AdminResultsApi, AdminGroupResultsPreviewDTO, AdminApplyResultsRequest, AdminApplyResultsResponse } from './admin-results.api';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

type Groupe = { id: number; nom: string; specialite: string };

@Component({
    selector: 'app-admin-results',
    standalone: true,
    templateUrl: './admin-results.component.html',
    styleUrls: ['./admin-results.component.css'],
    imports: [CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule],
})
export class AdminResultsComponent implements OnInit {
    private http = inject(HttpClient);
    private api = inject(AdminResultsApi);

    groups: Groupe[] = [];
    selectedGroupId: number | null = null;

    loading = signal(false);
    preview = signal<AdminGroupResultsPreviewDTO | null>(null);
    subjects = computed(() => this.preview()?.expectedSubjects ?? []);

    ngOnInit(): void {
        this.http.get<Groupe[]>('/api/admin/groups').subscribe({
            next: (gs) => {
                this.groups = gs || [];
                // Auto-select first group if you want an immediate view:
                // if (this.groups.length) this.onGroupChanged(this.groups[0].id);
            },
            error: () => (this.groups = []),
        });
    }

    onGroupChanged(groupId: number | null): void {
        this.selectedGroupId = groupId;
        this.preview.set(null);
        if (!groupId) return;

        this.loading.set(true);
        this.api.preview(groupId).subscribe({
            next: (p) => this.preview.set(p),
            error: () => this.loading.set(false),
            complete: () => this.loading.set(false),
        });
    }

    applyPromotion(): void {
        const p = this.preview();
        if (!p) return;

        if (!p.allComplete) {
            Swal.fire('Incomplete', 'Some subjects are not graded yet. Please finish grading before promotion.', 'warning');
            return;
        }

        const body: AdminApplyResultsRequest = {
            groupeId: p.groupId,
            // If suggestedNextGroupId is null (e.g., A->B missing), backend will auto-create B
            targetGroupId: p.suggestedNextGroupId ?? null,
        };

        Swal.fire({
            icon: 'question',
            title: 'Promote and publish results?',
            html: `
        <div style="text-align:left">
          <p><strong>Source group:</strong> ${p.groupName}</p>
          <p><strong>Suggested target:</strong> ${p.suggestedNextGroupName || '—'}</p>
          <p><strong>Admitted:</strong> ${p.admittedCount} &nbsp; | &nbsp; <strong>Rejected:</strong> ${p.refusedCount}</p>
          <hr/>
          <p>This will roll over to the new year and purge all current grades & claims for this group's students.</p>
        </div>
      `,
            showCancelButton: true,
            confirmButtonText: 'Confirm & Publish',
            cancelButtonText: 'Cancel',
        }).then(res => {
            if (!res.isConfirmed) return;

            this.api.apply(body).subscribe({
                next: (resp: AdminApplyResultsResponse) => {
                    Swal.fire(
                        'Published',
                        `Promoted to <b>${resp.targetGroupName}</b>: ${resp.movedCount}<br/>
             Purged grades: ${resp.purgedNotesCount}<br/>
             Purged claims: ${resp.purgedClaimsCount}`,
                        'success'
                    );
                    // Refresh view
                    this.onGroupChanged(p.groupId);
                },
                error: (e) => Swal.fire('Error', e?.error?.message || 'Failed to apply promotion.', 'error'),
            });
        });
    }

    statusClass(s: string): string {
        if (s === 'ADMITTED') return 'aa-badge aa-ok';
        if (s === 'REJECTED') return 'aa-badge aa-bad';
        return 'aa-badge aa-pending';
    }
}
