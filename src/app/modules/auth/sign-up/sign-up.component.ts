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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import {CommonModule} from "@angular/common";

@Component({
    selector: 'auth-sign-up',
    templateUrl: './sign-up.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        CommonModule,          // ✅ nécessaire pour *ngIf
        RouterLink,
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
    ],
})
export class AuthSignUpComponent implements OnInit {
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signUpForm: UntypedFormGroup;
    showAlert: boolean = false;
    selectedImageFile: File;
    profileImageUrl: string | ArrayBuffer = '';

    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) {}

    ngOnInit(): void {
        this.signUpForm = this._formBuilder.group({
            name: [
                '',
                [
                    Validators.required,
                    Validators.pattern(/^[A-Za-zÀ-ÿ\s]+$/),
                ],
            ],
            email: ['', [Validators.required, Validators.email]],
            password: [
                '',
                [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/),
                ],
            ],
            company: [''],
            agreements: ['', Validators.requiredTrue],
        });
    }

    signUp(): void {
        if (this.signUpForm.invalid) return;

        this.signUpForm.disable();
        this.showAlert = false;

        const formData = new FormData();
        formData.append('fullname', this.signUpForm.get('name').value);
        formData.append('email', this.signUpForm.get('email').value);
        formData.append('password', this.signUpForm.get('password').value);
        formData.append('company', this.signUpForm.get('company').value || '');

        if (this.selectedImageFile) {
            formData.append('image', this.selectedImageFile);
        }

        this._authService.signUp(formData).subscribe(
            () => this._router.navigateByUrl('/confirmation-required'),
            () => {
                this.signUpForm.enable();
                this.signUpNgForm.resetForm();
                this.alert = {
                    type: 'error',
                    message: 'Something went wrong, please try again.',
                };
                this.showAlert = true;
            }
        );
    }

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
}
