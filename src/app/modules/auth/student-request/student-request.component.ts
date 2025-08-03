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
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { CommonModule } from '@angular/common';
import { AuthService } from 'app/core/auth/auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'student-request',
    templateUrl: './student-request.component.html',
    styleUrls: ['./student-request.component.css'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatSelectModule,
        MatProgressSpinnerModule,

    ],
})
export class StudentRequestComponent implements OnInit {
    @ViewChild('requestNgForm') requestNgForm: NgForm;

    requestForm: UntypedFormGroup;
    selectedImageFile: File;
    profileImageUrl: string | ArrayBuffer = '';
    isLoading = false;

    specialites: string[] = [
        "Cybersecurity & Ethical Hacking",
        "Web Development",
        "Mobile Application Development",
        "Graphic Design & Multimedia",
        "Digital Marketing & Social Media Management",
        "Electrical Installation & Building Wiring",
        "Plumbing & Sanitary Installations",
        "Masonry & Concrete Works",
        "Carpentry & Woodworking",
        "HVAC Systems",
        "Accounting & Financial Management",
        "Human Resources Management",
        "Office Administration & Secretarial Studies",
        "Sales & Commercial Techniques",
        "Logistics & Supply Chain Management"
    ];

    constructor(private _authService: AuthService, private _formBuilder: UntypedFormBuilder, private _router: Router) {}

    ngOnInit(): void {
        this.requestForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            specialite: ['', Validators.required],
            agreements: ['', Validators.requiredTrue],
        });
    }

    submitRequest(): void {
        if (this.requestForm.invalid) {
            Swal.fire({
                icon: 'warning',
                title: 'Form Incomplete',
                text: 'Please fill in all required fields correctly.',
                confirmButtonColor: '#f59e0b',
            });
            return;
        }

        this.isLoading = true;
        this.requestForm.disable();

        const formData = new FormData();
        formData.append('email', this.requestForm.get('email')?.value);
        formData.append('specialite', this.requestForm.get('specialite')?.value);
        if (this.selectedImageFile) {
            formData.append('image', this.selectedImageFile);
        }

        this._authService.submitRequest(formData).subscribe(
            () => {
                this.isLoading = false;
                this.requestForm.enable();
                this.requestNgForm.resetForm();

                Swal.fire({
                    icon: 'success',
                    title: 'Request Submitted',
                    text: 'Your request has been submitted successfully!',
                    confirmButtonColor: '#3085d6',
                    timer: 2500,
                    timerProgressBar: true
                }).then(() => {
                    this._router.navigate(['/sign-in']); // ✅ redirection après succès
                });
            },
            () => {
                this.isLoading = false;
                this.requestForm.enable();

                Swal.fire({
                    icon: 'error',
                    title: 'Submission Failed',
                    text: 'Something went wrong. Please try again.',
                    confirmButtonColor: '#d33',
                });
            }
        );
    }


    onImageSelected(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            this.selectedImageFile = file;
            const reader = new FileReader();
            reader.onload = () => (this.profileImageUrl = reader.result!);
            reader.readAsDataURL(file);
        }
    }
}
