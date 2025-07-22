import { Component } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { AuthService } from 'app/core/auth/auth.service';
import Swal from 'sweetalert2';
import {Router, RouterLink} from '@angular/router';
import {
    MatFormFieldModule
} from "@angular/material/form-field";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'auth-verify-code',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        RouterLink
    ],
    templateUrl: './verify-code.component.html'
})
export class VerifyCodeComponent {
    verifyCodeForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.verifyCodeForm = this.fb.group({
            code: ['', [Validators.required]]
        });
    }

    verifyCode(): void {
        if (this.verifyCodeForm.invalid) return;

        const code = this.verifyCodeForm.value.code;
        const email = localStorage.getItem('resetEmail');

        if (!email) {
            Swal.fire('Error', 'No email found. Please restart the process.', 'error');
            return;
        }

        this.authService.verifyCode(email, code).subscribe({
            next: () => {
                Swal.fire('Success', 'Code verified successfully!', 'success').then(() => {
                    this.router.navigate(['/reset-password']);
                });
            },
            error: (err) => {
                Swal.fire('Error', err.error || 'Invalid code', 'error');
            }
        });
    }
}
