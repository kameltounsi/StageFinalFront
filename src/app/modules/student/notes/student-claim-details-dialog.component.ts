// src/app/modules/student/notes/student-claim-details-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NoteClaimDTO } from './student-notes.api';

type Data = { claim: NoteClaimDTO };

@Component({
    selector: 'app-student-claim-details-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule],
    templateUrl: './student-claim-details-dialog.component.html',
    styleUrls: ['./student-claim-details-dialog.component.css'],
})
export class StudentClaimDetailsDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: Data,
        public ref: MatDialogRef<StudentClaimDetailsDialogComponent>
    ) {}
}
