import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import {UserService} from "../../layout/common/user/user.service";
import {User} from "../../core/user/user.types";

function matchOther(controlName: string) {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.parent) return null;
        const other = control.parent.get(controlName);
        if (!other) return null;
        return other.value === control.value ? null : { mustMatch: true };
    };
}

@Component({
    selector: 'app-profile',
    standalone: true,
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
    ],
})
export class ProfileComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    user: User | null = null;

    // Password form
    passwordForm = this.fb.group({
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmNewPassword: ['', [Validators.required, matchOther('newPassword')]],
    });

    // Upload state
    selectedFile: File | null = null;
    previewUrl: string | null = null;
    uploading = false;
    changingPwd = false;

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private http: HttpClient,
        private snack: MatSnackBar,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.userService.user$
            .pipe(takeUntil(this.destroy$))
            .subscribe((u) => {
                this.user = u;
                this.cdr.markForCheck();
            });
    }

    ngOnDestroy(): void {
        if (this.previewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(this.previewUrl);
        }
        this.destroy$.next();
        this.destroy$.complete();
    }

    get currentAvatar(): string {
        const a = (this.user as any)?.profilePicture || (this.user as any)?.avatar;
        return a || 'assets/images/avatars/avatar-default.png';
    }

    onFileSelected(evt: Event): void {
        const input = evt.target as HTMLInputElement;
        const file = input.files && input.files[0];
        if (!file) {
            this.clearSelection();
            return;
        }
        if (!file.type.startsWith('image/')) {
            this.snack.open('Please select an image file.', 'Dismiss', { duration: 2500 });
            this.clearSelection();
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            this.snack.open('Max file size is 5MB.', 'Dismiss', { duration: 3000 });
            this.clearSelection();
            return;
        }

        this.selectedFile = file;

        // Local preview (optional)
        if (this.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(this.previewUrl);
        this.previewUrl = URL.createObjectURL(file);
        this.cdr.markForCheck();

        // ⤵️ Immediately upload after choosing the file
        this.uploadAvatar();
    }

    clearSelection(): void {
        this.selectedFile = null;
        if (this.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(this.previewUrl);
        this.previewUrl = null;
        this.cdr.markForCheck();
    }

    uploadAvatar(): void {
        if (!this.selectedFile) return;
        this.uploading = true;

        // Use service helper; after success we will SweetAlert and reload
        this.userService.updateProfilePicture(this.selectedFile).subscribe({
            next: async () => {
                this.uploading = false;
                this.clearSelection();
                this.cdr.markForCheck();

                await Swal.fire({
                    icon: 'success',
                    title: 'Profile photo updated',
                    text: 'We will reload your dashboard.',
                    confirmButtonText: 'OK',
                });

                // Full reload after success (as requested)
                this.router.navigateByUrl('/dashboard').then(() => window.location.reload());
            },
            error: async () => {
                this.uploading = false;
                this.cdr.markForCheck();
                await Swal.fire({
                    icon: 'error',
                    title: 'Upload failed',
                    text: 'Please try again with a different image.',
                    confirmButtonText: 'OK',
                });
            },
        });
    }

    changePassword(): void {
        if (this.passwordForm.invalid) {
            this.passwordForm.markAllAsTouched();
            return;
        }
        this.changingPwd = true;

        const body = {
            currentPassword: this.passwordForm.value.currentPassword!,
            newPassword: this.passwordForm.value.newPassword!,
        };

        this.http.post('/api/users/me/password', body).subscribe({
            next: async () => {
                this.changingPwd = false;
                this.passwordForm.reset();
                this.cdr.markForCheck();

                await Swal.fire({
                    icon: 'success',
                    title: 'Password changed',
                    text: 'We will reload your dashboard.',
                    confirmButtonText: 'OK',
                });

                this.router.navigateByUrl('/dashboard').then(() => window.location.reload());
            },
            error: async (err) => {
                this.changingPwd = false;
                this.cdr.markForCheck();
                const msg = err?.error?.message || 'Failed to change password.';
                await Swal.fire({
                    icon: 'error',
                    title: 'Could not change password',
                    text: msg,
                    confirmButtonText: 'OK',
                });
            },
        });
    }
}
