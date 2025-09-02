// src/app/modules/trainer/claims/decide-claim-dialog.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TrainerClaimsApi, NoteClaimDTO } from './trainer-claims.api';

type Data = { mode: 'approve'|'reject'; claim: NoteClaimDTO };

@Component({
    selector: 'app-decide-claim-dialog',
    standalone: true,
    templateUrl: './decide-claim-dialog.component.html',
    imports: [
        CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule
    ]
})
export class DecideClaimDialogComponent {
    private api = inject(TrainerClaimsApi);
    private fb = inject(FormBuilder);
    ref = inject(MatDialogRef<DecideClaimDialogComponent>);
    data = inject<Data>(MAT_DIALOG_DATA);

    form = this.fb.group({
        reply: this.fb.control<string>('', this.data.mode === 'reject' ? [Validators.required, Validators.minLength(5)] : []),
        newCc: this.fb.control<number | null>(null, []),
        newExamen: this.fb.control<number | null>(null, []),
    });

    saving = false;

    save() {
        if (this.data.mode === 'reject') {
            if (this.form.invalid) return;
            this.saving = true;
            this.api.reject(this.data.claim.id, { reply: this.form.value.reply!.trim() })
                .subscribe({
                    next: () => { this.saving = false; this.ref.close(true); },
                    error: () => { this.saving = false; }
                });
            return;
        }

        // approve
        const body: any = {};
        const r = this.form.value.reply?.trim();
        if (r) body.reply = r;

        const cc = this.form.value.newCc;
        const ex = this.form.value.newExamen;
        const inRange = (v: number | null | undefined) => v == null || (v >= 0 && v <= 20);

        if (!inRange(cc) || !inRange(ex)) {
            this.form.setErrors({ range: true });
            return;
        }
        if (cc != null) body.newCc = cc;
        if (ex != null) body.newExamen = ex;

        this.saving = true;
        this.api.approve(this.data.claim.id, body)
            .subscribe({
                next: () => { this.saving = false; this.ref.close(true); },
                error: () => { this.saving = false; }
            });
    }

    cancel() { this.ref.close(false); }
}
