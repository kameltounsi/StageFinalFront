import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule,
    AbstractControl,
    AsyncValidatorFn
} from '@angular/forms';
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
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";

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
        NgOptimizedImage,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem
    ]
})
export class AddUserComponent {
    @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
    @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

    addUserForm: FormGroup;
    roles: string[] = ['ADMIN', 'TRAINER', 'STUDENT'];
    selectedImageFile: File | null = null;
    profileImageUrl: string | ArrayBuffer | null = null;
    isLoading = false;
    submitted = false;

    showCamera = false;
    videoStream: MediaStream | null = null;

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
                [this.emailExistsValidator()]
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

    get f() {
        return this.addUserForm.controls;
    }

    emailExistsValidator(): AsyncValidatorFn {
        return (control: AbstractControl) => {
            if (!control.value) return of(null);
            return this.userService.checkEmail(control.value).pipe(
                map((res: { exists: boolean }) => res.exists ? { emailExists: true } : null),
                catchError(() => of(null))
            );
        };
    }

    openFilePicker(): void {
        const input = document.querySelector<HTMLInputElement>('#fileInput');
        if (input) input.click();
    }

    onImageSelected(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            this.selectedImageFile = file;
            const reader = new FileReader();
            reader.onload = () => { this.profileImageUrl = reader.result!; };
            reader.readAsDataURL(file);
        }
    }

    async openCamera(): Promise<void> {
        this.showCamera = true;
        try {
            this.videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (this.videoRef?.nativeElement) {
                this.videoRef.nativeElement.srcObject = this.videoStream;
            }
        } catch (error) {
            Swal.fire('Error', 'Cannot access camera.', 'error');
        }
    }

    capturePhoto(): void {
        if (!this.videoRef || !this.canvasRef) return;

        const video = this.videoRef.nativeElement;
        const canvas = this.canvasRef.nativeElement;
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (blob) {
                this.selectedImageFile = new File([blob], "captured.png", { type: "image/png" });
                this.profileImageUrl = URL.createObjectURL(this.selectedImageFile);
            }
        });

        this.closeCamera();
    }

    closeCamera(): void {
        this.showCamera = false;
        this.videoStream?.getTracks().forEach(track => track.stop());
    }

    onSubmit(): void {
        this.submitted = true;
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
        if (this.selectedImageFile) formData.append('image', this.selectedImageFile);

        this.userService.addUser(formData).subscribe({
            next: (res) => {
                this.isLoading = false;
                Swal.fire({
                    icon: 'success',
                    title: 'User Added',
                    text: res?.message || `The user ${this.addUserForm.get('fullName')?.value} has been successfully added.`,
                    confirmButtonColor: '#3085d6'
                }).then(() => this.dialogRef.close('success'));
            },
            error: (err) => {
                this.isLoading = false;
                let errorMessage = err.error?.message || 'User could not be added.';
                if (err.status === 409) errorMessage = 'A user with this email already exists.';
                Swal.fire({ icon: 'error', title: 'Error', text: errorMessage, confirmButtonColor: '#d33' });
            }
        });
    }

    onCancel(): void {
        this.dialogRef.close('cancel');
    }
}
