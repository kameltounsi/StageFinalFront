import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { ManageUsersService } from '../manage-users.service';
import { MatCard } from "@angular/material/card";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatOption } from "@angular/material/core";
import { MatSelect } from "@angular/material/select";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { NgForOf, NgIf } from "@angular/common";

@Component({
    selector: 'app-add-user',
    templateUrl: './add-user.component.html',
    styleUrls: ['./add-user.component.css'],
    standalone: true,
    imports: [
        MatLabel,
        MatCard,
        ReactiveFormsModule,
        MatFormField,
        MatOption,
        MatSelect,
        MatButton,
        MatIcon,
        MatInput,
        NgIf,
        NgForOf
    ]
})
export class AddUserComponent {
    addUserForm: FormGroup;
    roles: string[] = ['ADMIN', 'TRAINER', 'STUDENT'];
    selectedImageFile: File | null = null;
    profileImageUrl: string | ArrayBuffer | null = null;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private userService: ManageUsersService,
        public dialogRef: MatDialogRef<AddUserComponent>, // ✅ pour fermer le dialog
        @Inject(MAT_DIALOG_DATA) public data: any // ✅ si tu veux passer des données au dialog
    ) {
        this.addUserForm = this.fb.group({
            fullName: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÿ\s]+$/)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            role: ['', Validators.required]
        });
    }

    // Gestion image
    onImageSelected(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            this.selectedImageFile = file;
            const reader = new FileReader();
            reader.onload = () => {
                this.profileImageUrl = reader.result!;
            };
            reader.readAsDataURL(file);
        }
    }

    // Soumission
    onSubmit(): void {
        if (this.addUserForm.invalid) return;

        this.isLoading = true;
        const formData = new FormData();
        formData.append('fullname', this.addUserForm.get('fullName')?.value); // ⚠️ attention au nom : backend attend "fullname"
        formData.append('email', this.addUserForm.get('email')?.value);
        formData.append('password', this.addUserForm.get('password')?.value);
        formData.append('role', this.addUserForm.get('role')?.value);
        if (this.selectedImageFile) {
            formData.append('image', this.selectedImageFile);
        }

        this.userService.addUser(formData).subscribe({
            next: (res) => {
                this.isLoading = false;
                Swal.fire({
                    icon: 'success',
                    title: 'User Added',
                    text: res?.message || `The user ${this.addUserForm.get('fullName')?.value} has been successfully added.`,
                    confirmButtonColor: '#3085d6'
                }).then(() => {
                    this.dialogRef.close('success'); // ✅ ferme le dialog après succès
                });
            },
            error: (err) => {
                this.isLoading = false;
                console.error('Error response:', err);

                // Récupérer le message d’erreur du backend
                let errorMessage = 'User could not be added.';
                if (err.error && err.error.error) {
                    errorMessage = err.error.error; // backend renvoie {"error": "..."}
                } else if (err.error && err.error.message) {
                    errorMessage = err.error.message; // backend renvoie {"message": "..."} en cas d’erreur
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorMessage,
                    confirmButtonColor: '#d33'
                });
            }
        });
    }


    onCancel(): void {
        this.dialogRef.close('cancel');
    }
}
