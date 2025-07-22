import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {Router, RouterLink} from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { finalize } from 'rxjs';
import Swal from "sweetalert2";

@Component({
    selector: 'auth-forgot-password',
    templateUrl: './forgot-password.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        RouterLink,
    ],
})
export class AuthForgotPasswordComponent implements OnInit {
    @ViewChild('forgotPasswordNgForm') forgotPasswordNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    forgotPasswordForm: UntypedFormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router // ✅ Injection ici

) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.forgotPasswordForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Send the reset link
     */
    sendResetLink(): void {
        if (this.forgotPasswordForm.invalid) return;

        this.forgotPasswordForm.disable();
        this.showAlert = false;

        const email = this.forgotPasswordForm.get('email')?.value;

        this._authService
            .forgotPassword(email)
            .pipe(
                finalize(() => {
                    this.forgotPasswordForm.enable();
                    this.forgotPasswordNgForm.resetForm();
                })
            )
            .subscribe({
                next: () => {
                    // ✅ Sauvegarder l'email dans le localStorage
                    localStorage.setItem('resetEmail', email);

                    // ✅ Afficher l'alerte puis rediriger
                    Swal.fire({
                        icon: 'success',
                        title: 'Email envoyé',
                        text: "Un code de réinitialisation a été envoyé à votre adresse email.",
                        confirmButtonColor: '#3085d6',
                    }).then(() => {
                        this._router.navigate(['/verify-code'], {
                            queryParams: { email }  // Optionnel ici si tu utilises localStorage
                        });
                    });
                },
                error: (err) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur',
                        text: err?.error || 'Aucun utilisateur trouvé avec cet email.',
                        confirmButtonColor: '#d33',
                    });
                }
            });
    }


}
