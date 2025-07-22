import {
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import {
    MatButtonModule
} from '@angular/material/button';
import {
    MatFormFieldModule
} from '@angular/material/form-field';
import {
    MatIconModule
} from '@angular/material/icon';
import {
    MatInputModule
} from '@angular/material/input';
import {
    MatProgressSpinnerModule
} from '@angular/material/progress-spinner';
import {
    Router,
    RouterLink
} from '@angular/router';
import {
    fuseAnimations
} from '@fuse/animations';
import {
    FuseAlertComponent,
    FuseAlertType
} from '@fuse/components/alert';
import {
    FuseValidators
} from '@fuse/validators';
import {
    AuthService
} from 'app/core/auth/auth.service';
import {
    finalize
} from 'rxjs';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common'; // ✅ Ajoutez ceci

@Component({
    selector: 'auth-reset-password',
    templateUrl: './reset-password.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        CommonModule,
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        RouterLink,
    ],
})
export class AuthResetPasswordComponent implements OnInit {
    @ViewChild('resetPasswordNgForm') resetPasswordNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    resetPasswordForm: UntypedFormGroup;
    showAlert: boolean = false;

    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) {}

    ngOnInit(): void {
        this.resetPasswordForm = this._formBuilder.group(
            {
                password: [
                    '',
                    [
                        Validators.required,
                        Validators.minLength(8),
                        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/),
                    ],
                ],
                passwordConfirm: ['', Validators.required],
            },
            {
                validators: FuseValidators.mustMatch('password', 'passwordConfirm'),
            }
        );
    }

    resetPassword(): void {
        if (this.resetPasswordForm.invalid) return;

        this.resetPasswordForm.disable();
        this.showAlert = false;

        const newPassword = this.resetPasswordForm.get('password')?.value;
        const email = localStorage.getItem('resetEmail');

        if (!email) {
            this.alert = {
                type: 'error',
                message: 'Aucun email trouvé. Veuillez recommencer le processus.',
            };
            this.showAlert = true;
            this.resetPasswordForm.enable();
            return;
        }

        this._authService
            .resetPassword(email, newPassword)
            .pipe(finalize(() => {
                this.resetPasswordForm.enable();
                this.resetPasswordNgForm.resetForm();
            }))
            .subscribe({
                next: () => {
                    localStorage.removeItem('resetEmail');
                    Swal.fire({
                        icon: 'success',
                        title: 'Mot de passe réinitialisé',
                        text: 'Votre mot de passe a été changé avec succès.',
                        confirmButtonText: 'Se connecter',
                        confirmButtonColor: '#3085d6',
                    }).then(() => {
                        this._router.navigate(['/sign-in']);
                    });
                },
                error: () => {
                    this.alert = {
                        type: 'error',
                        message: 'Une erreur est survenue. Veuillez réessayer.',
                    };
                    this.showAlert = true;
                },
            });
    }
    get passwordErrors(): string[] {
        const passwordControl = this.resetPasswordForm.get('password');
        const errors: string[] = [];

        if (!passwordControl || !passwordControl.value) return [];

        const value = passwordControl.value;

        if (!/[A-Z]/.test(value)) errors.push('Must contain at least one uppercase letter');
        if (!/[a-z]/.test(value)) errors.push('Must contain at least one lowercase letter');
        if (!/[0-9]/.test(value)) errors.push('Must contain at least one number');
        if (!/[\W_]/.test(value)) errors.push('Must contain at least one symbol');
        if (value.length < 8) errors.push('Minimum 8 characters required');

        return errors;
    }

}
