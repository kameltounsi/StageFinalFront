import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDivider } from "@angular/material/divider";

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
        this.loadGroup();
    }

    loadGroup(): void {
        this.http.get<any>(`http://localhost:8089/api/groups/${this.group.id}`)
            .subscribe(res => {
                this.group = res;
                this.group.students = this.group.students || [];
                this.group.trainers = this.group.trainers || [];
                this.loadAvailableMembers();
            });
    }

    // ✅ Ajout d’un nettoyage du paramètre spécialité
    loadAvailableMembers(): void {
        const specialiteCleaned = this.group.specialite?.trim().toLowerCase();

        this.http.get<any[]>(`http://localhost:8089/api/groups/available-students?specialite=${encodeURIComponent(specialiteCleaned)}`)
            .subscribe(res => this.availableStudents = res);

        this.http.get<any[]>(`http://localhost:8089/api/groups/available-trainers?specialite=${encodeURIComponent(specialiteCleaned)}`)
            .subscribe(res => this.availableTrainers = res);
    }

    addStudent(): void {
        if (!this.selectedStudentId) return;
        const student = this.availableStudents.find(s => s.id === this.selectedStudentId);

        Swal.fire({
            title: '⚠️ Confirmation',
            text: `Voulez-vous vraiment ajouter ${student?.fullName} au groupe ${this.group.nom} ?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Oui, ajouter',
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        }).then((result) => {
            if (result.isConfirmed) {
                this.http.post(`http://localhost:8089/api/groups/${this.group.id}/add-student/${this.selectedStudentId}`, {})
                    .subscribe({
                        next: () => {
                            this.selectedStudentId = undefined;
                            this.loadGroup();
                            Swal.fire('✅ Succès', `${student?.fullName} a été ajouté au groupe ${this.group.nom}.`, 'success');
                        },
                        error: () => Swal.fire('❌ Erreur', 'Impossible d’ajouter l’étudiant.', 'error')
                    });
            }
        });
    }

    addTrainer(): void {
        if (!this.selectedTrainerId) return;
        const trainer = this.availableTrainers.find(t => t.id === this.selectedTrainerId);

        Swal.fire({
            title: '⚠️ Confirmation',
            text: `Voulez-vous vraiment ajouter ${trainer?.fullName} au groupe ${this.group.nom} ?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Oui, ajouter',
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        }).then((result) => {
            if (result.isConfirmed) {
                this.http.post(`http://localhost:8089/api/groups/${this.group.id}/add-trainer/${this.selectedTrainerId}`, {})
                    .subscribe({
                        next: () => {
                            this.selectedTrainerId = undefined;
                            this.loadGroup();
                            Swal.fire('✅ Succès', `${trainer?.fullName} a été ajouté au groupe ${this.group.nom}.`, 'success');
                        },
                        error: () => Swal.fire('❌ Erreur', 'Impossible d’ajouter le formateur.', 'error')
                    });
            }
        });
    }

    removeStudent(studentId: number): void {
        const student = this.group.students.find((s: any) => s.id === studentId);
        Swal.fire({
            title: '⚠️ Confirmation',
            text: `Êtes-vous sûr de vouloir supprimer ${student?.fullName} du groupe ${this.group.nom} ?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6'
        }).then((result) => {
            if (result.isConfirmed) {
                this.http.delete(`http://localhost:8089/api/groups/${this.group.id}/remove-student/${studentId}`, { responseType: 'text' as 'json' })
                    .subscribe({
                        next: () => {
                            this.loadGroup();
                            Swal.fire('✅ Supprimé', `${student?.fullName} a été retiré du groupe ${this.group.nom}.`, 'success');
                        },
                        error: () => Swal.fire('❌ Erreur', 'Impossible de supprimer l’étudiant.', 'error')
                    });
            }
        });
    }

    removeTrainer(trainerId: number): void {
        const trainer = this.group.trainers.find((t: any) => t.id === trainerId);
        Swal.fire({
            title: '⚠️ Confirmation',
            text: `Êtes-vous sûr de vouloir supprimer ${trainer?.fullName} du groupe ${this.group.nom} ?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6'
        }).then((result) => {
            if (result.isConfirmed) {
                this.http.delete(`http://localhost:8089/api/groups/${this.group.id}/remove-trainer/${trainerId}`, { responseType: 'text' as 'json' })
                    .subscribe({
                        next: () => {
                            this.loadGroup();
                            Swal.fire('✅ Supprimé', `${trainer?.fullName} a été retiré du groupe ${this.group.nom}.`, 'success');
                        },
                        error: () => Swal.fire('❌ Erreur', 'Impossible de supprimer le formateur.', 'error')
                    });
            }
        });
    }

    close(): void {
        this.dialogRef.close();
    }
}
