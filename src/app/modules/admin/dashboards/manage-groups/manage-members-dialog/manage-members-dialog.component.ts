import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import {MatDivider} from "@angular/material/divider";

@Component({
    selector: 'app-manage-members-dialog',
    standalone: true,
    templateUrl: './manage-members-dialog.component.html',
    styleUrls: ['./manage-members-dialog.component.css'],
    imports: [
        NgForOf,
        NgIf,
        FormsModule,
        MatButtonModule,
        MatDivider,
        MatIconModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatCardModule
    ]
})
export class ManageMembersDialogComponent {
    group: any;
    availableStudents: any[] = [];
    availableTrainers: any[] = [];
    selectedStudentId?: number;
    selectedTrainerId?: number;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<ManageMembersDialogComponent>,
        private http: HttpClient
    ) {
        this.group = data.group;
        this.group.students = this.group.students || [];
        this.group.trainers = this.group.trainers || [];
        this.loadGroup(); // charge groupe complet au départ
    }

    // 🔹 Récupère le groupe depuis le backend
    loadGroup(): void {
        this.http.get<any>(`http://localhost:8089/api/groups/${this.group.id}`)
            .subscribe(res => {
                this.group = res;
                this.group.students = this.group.students || [];
                this.group.trainers = this.group.trainers || [];
                this.loadAvailableMembers(); // recharge les listes filtrées
            });
    }

    loadAvailableMembers(): void {
        this.http.get<any[]>(`http://localhost:8089/api/groups/available-students?specialite=${this.group.specialite}`)
            .subscribe(res => this.availableStudents = res);

        this.http.get<any[]>(`http://localhost:8089/api/groups/available-trainers?specialite=${this.group.specialite}`)
            .subscribe(res => this.availableTrainers = res);
    }


    addStudent(): void {
        if (!this.selectedStudentId) return;
        this.http.post(`http://localhost:8089/api/groups/${this.group.id}/add-student/${this.selectedStudentId}`, {})
            .subscribe(() => {
                this.selectedStudentId = undefined;
                this.loadGroup(); // ✅ recharge liste actualisée
            });
    }

    addTrainer(): void {
        if (!this.selectedTrainerId) return;
        this.http.post(`http://localhost:8089/api/groups/${this.group.id}/add-trainer/${this.selectedTrainerId}`, {})
            .subscribe(() => {
                this.selectedTrainerId = undefined;
                this.loadGroup(); // 🔥 recharge les trainers depuis le backend
            });
    }


    removeStudent(studentId: number): void {
        this.http.delete(`http://localhost:8089/api/groups/${this.group.id}/remove-student/${studentId}`)
            .subscribe(() => this.loadGroup()); // ✅ recharge liste actualisée
    }

    removeTrainer(trainerId: number): void {
        this.http.delete(`http://localhost:8089/api/groups/${this.group.id}/remove-trainer/${trainerId}`)
            .subscribe(() => this.loadGroup()); // ✅ recharge liste actualisée
    }

    close(): void {
        this.dialogRef.close();
    }
}
