import { Component } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import Swal from 'sweetalert2';
import {CommonModule, NgClass} from "@angular/common";
import {MatFormField} from "@angular/material/form-field";
import { MatInputModule } from '@angular/material/input';
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'auth-reset-flow',
    templateUrl: './reset-flow.component.html',
    styleUrls: ['./reset-flow.component.css'],
    imports: [
        NgClass,
        MatFormField,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        MatInputModule,
        MatIcon,
        MatIconButton,
        MatButton,

    ],
    standalone: true,
})
export class ResetFlowComponent {
    step = 1;
    errorMessage = '';
    email = '';
    code = '';
    passwordForm: FormGroup;
    newPassword: string = '';
    confirmPassword: string = '';
    stepError: string = '';
    showPassword = false;
    showConfirmPassword = false;

    constructor(private fb: FormBuilder,    private cdr: ChangeDetectorRef // ✅ injection ici
,    private authService: AuthService, private router: Router) {
        this.passwordForm = this.fb.group({
            password: ['', [Validators.required, Validators.minLength(8),
                Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)]],
            passwordConfirm: ['', Validators.required]
        }, // ✅ Force Angular à prendre en compte les changements
        { validators: this.matchPasswords });

    }

    matchPasswords(group: FormGroup) {
        return group.get('password')?.value === group.get('passwordConfirm')?.value ? null : { notMatching: true };
    }

    goToStep(step: number) {
        if (step === 2 && !this.email) {
            this.errorMessage = 'You must enter your email first.';
            return;
        }
        if (step === 3 && !this.code) {
            this.errorMessage = 'You must verify your code first.';
            return;
        }
        this.errorMessage = '';
        this.step = step;
    }

    sendEmail() {
        if (!this.email) return;
        this.authService.forgotPassword(this.email).subscribe({
            next: () => {
                Swal.fire('Success', 'Reset code sent!', 'success');
                this.goToStep(2);
            },
            error: () => Swal.fire('Error', 'Email not found.', 'error')
        });
    }
/*
    verifyCode() {
        if (!this.code) {
            Swal.fire('Error', 'Please enter the verification code.', 'error');
            return;
        }

        this.authService.verifyCode(this.email, this.code).subscribe({
            next: () => {
                Swal.fire('Success', 'Code verified!', 'success');
                this.step = 3;
            },
            error: (error) => {
                console.error('Verification failed', error);
                // Ne rien changer à l'étape ici
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Code',
                    text: 'The reset code is incorrect. Please try again.'
                });
            }
        });
    }
*/
    verifyCode() {
        if (!this.code) return;

        this.authService.verifyCode(this.email, this.code).subscribe({
            next: () => {
                Swal.fire('Success', 'Code verified!', 'success');
                this.goToStep(3);
                this.cdr.detectChanges(); // ✅
            },
            error: (err) => {
                if (err.status === 401) {
                    Swal.fire('Error', 'Invalid code. Please try again.', 'error');
                } else {
                    Swal.fire('Error', 'An unexpected error occurred.', 'error');
                }
            }
        });
    }

    resetPassword() {
        if (this.passwordForm.invalid) return;
        const password = this.passwordForm.value.password;
        this.authService.resetPassword(this.email, password).subscribe({
            next: () => {
                Swal.fire('Success', 'Password reset successfully.', 'success').then(() => {
                    this.router.navigate(['/sign-in']);
                });
            },
            error: () => Swal.fire('Error', 'Failed to reset password.', 'error')
        });
    }
}
