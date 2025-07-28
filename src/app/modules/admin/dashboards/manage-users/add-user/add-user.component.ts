import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { ManageUsersService } from '../manage-users.service';
import { MatCard } from "@angular/material/card";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatOption } from "@angular/material/core";
import { MatSelect } from "@angular/material/select";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { NgForOf, NgIf, NgOptimizedImage } from "@angular/common";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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
        MatError,
        MatInput,
        NgIf,
        NgForOf,
        MatProgressSpinner,
        NgOptimizedImage
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
        public dialogRef: MatDialogRef<AddUserComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.addUserForm = this.fb.group({
            fullName: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÿ\s]+$/)]],
            email: [
                '',
                [Validators.required, Validators.email],
                [this.emailExistsValidator()] // ✅ ajout du validateur asynchrone
            ],
            password: [
                '',
                [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
                ]
            ],
            role: ['', Validators.required]
        });
    }

    // Getter pratique
    get f() {
        return this.addUserForm.controls;
    }

    // ✅ Validateur async pour vérifier si l’email existe déjà
    emailExistsValidator(): AsyncValidatorFn {
        return (control: AbstractControl) => {
            if (!control.value) {
                return of(null);
            }
            return this.userService.checkEmail(control.value).pipe(
                map((res: { exists: boolean }) => {
                    return res.exists ? { emailExists: true } : null;
                }),
                catchError(() => of(null)) // éviter les erreurs bloquantes
            );
        };
    }

    // Gestion de l’image
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
        if (this.addUserForm.invalid) {
            this.addUserForm.markAllAsTouched();
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Form',
                text: 'Please fill in all required fields correctly before submitting.',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        this.isLoading = true;

        const formData = new FormData();
        formData.append('fullname', this.addUserForm.get('fullName')?.value);
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
                    this.dialogRef.close('success');
                });
            },
            error: (err) => {
                this.isLoading = false;
                console.error('Error response:', err);

                let errorMessage = 'User could not be added.';
                if (err.error?.error) {
                    errorMessage = err.error.error;
                } else if (err.error?.message) {
                    errorMessage = err.error.message;
                } else {
                    switch (err.status) {
                        case 400:
                            errorMessage = 'Invalid data. Please check your input.';
                            break;
                        case 401:
                            errorMessage = 'You must be logged in to perform this action.';
                            break;
                        case 403:
                            errorMessage = 'You are not authorized to add a new user.';
                            break;
                        case 409:
                            errorMessage = 'A user with this email already exists.';
                            break;
                        case 500:
                            errorMessage = 'Server error occurred. Please try again later.';
                            break;
                    }
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
