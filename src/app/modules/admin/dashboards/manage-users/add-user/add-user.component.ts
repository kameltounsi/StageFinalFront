import { Component, Inject, ViewChild, ElementRef, OnInit } from '@angular/core';
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
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {NgForOf, NgIf} from "@angular/common";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatButton} from "@angular/material/button";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatIcon} from "@angular/material/icon";

@Component({
    selector: 'app-add-user',
    templateUrl: './add-user.component.html',
    styleUrls: ['./add-user.component.css'],
    standalone: true,
    imports: [ReactiveFormsModule, MatFormField, MatInput, MatLabel, NgIf, MatSelect, MatOption, MatButton, MatProgressSpinner, MatMenuTrigger, MatIcon, MatMenu, MatMenuItem, NgForOf]
})
export class AddUserComponent implements OnInit {
    @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
    @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

    addUserForm: FormGroup;
    roles: string[] = ['ADMIN', 'TRAINER', 'STUDENT'];
    groups: any[] = [];
    profileImageUrl: string | ArrayBuffer | null = null;
    selectedImageFile: File | null = null;
    isLoading = false;
    submitted = false;

    showCamera = false;
    videoStream: MediaStream | null = null;
    showGroupField = false; // ✅ visible uniquement si fromApprove = true

    constructor(
        private fb: FormBuilder,
        private userService: ManageUsersService,
        public dialogRef: MatDialogRef<AddUserComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.addUserForm = this.fb.group({
            fullName: [  // ⚡ corriger pour correspondre à ton HTML
                this.data?.fullname || '',
                [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÿ\s]+$/)]
            ],
            email: [
                this.data?.email || '',
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
            role: [
                { value: this.data?.fromApprove ? 'STUDENT' : '', disabled: this.data?.fromApprove },
                Validators.required
            ],
            group: [''] // ⚡ bien garder le même nom que dans HTML
        });

        if (this.data?.profilePicture) {
            this.profileImageUrl = this.data.profilePicture;
        }

        if (this.data?.fromApprove) {
            this.showGroupField = true;
        }
    }

    ngOnInit(): void {
        if (this.showGroupField && this.data?.specialite) {
            this.loadGroups(this.data.specialite);
        }
    }

    loadGroups(specialite: string): void {
        this.userService.getGroupsBySpecialiteAndLevel(specialite, 'A').subscribe({
            next: (res: any[]) => {
                this.groups = res;
                if (this.groups.length === 0) {
                    Swal.fire('Info', 'No groups found for this speciality.', 'info');
                }
            },
            error: () => Swal.fire('Error', 'Failed to load groups.', 'error')
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
        } catch {
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
        formData.append('fullname', this.addUserForm.get('fullname')?.value);
        formData.append('email', this.addUserForm.get('email')?.value);
        formData.append('password', this.addUserForm.get('password')?.value);
        formData.append('role', this.addUserForm.get('role')?.value || 'STUDENT');

        if (this.showGroupField) {
            formData.append('groupeId', this.addUserForm.get('groupe')?.value);
        }

        if (this.selectedImageFile) {
            formData.append('image', this.selectedImageFile);
        }

        this.userService.addUser(formData).subscribe({
            next: () => {
                this.isLoading = false;
                Swal.fire('Success', 'User added successfully!', 'success')
                    .then(() => this.dialogRef.close('success'));
            },
            error: () => {
                this.isLoading = false;
                Swal.fire('Error', 'User could not be added.', 'error');
            }
        });
    }

    onCancel(): void {
        this.dialogRef.close('cancel');
    }
}
