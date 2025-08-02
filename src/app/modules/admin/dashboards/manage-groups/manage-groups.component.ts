import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatCard, MatCardActions, MatCardContent} from "@angular/material/card";
import {NgForOf} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";

@Component({
    selector: 'app-manage-groups',
    templateUrl: './manage-groups.component.html',
    styleUrls: ['./manage-groups.component.css'],
    imports: [
        ReactiveFormsModule,
        MatFormField,
        MatSelect,
        MatLabel,
        MatOption,
        MatCardContent,
        MatCard,
        MatCardActions,
        NgForOf,
        MatButton,
        MatInput
    ],
    standalone: true
})
export class ManageGroupsComponent implements OnInit {
    groups: any[] = [];
    groupForm: FormGroup;

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

    niveaux: string[] = ["A", "B"];

    constructor(private fb: FormBuilder, private http: HttpClient) {
        this.groupForm = this.fb.group({
            specialite: ['', Validators.required],
            niveau: ['', Validators.required],
            trainerIds: [[]],
            studentIds: [[]]
        });
    }

    ngOnInit(): void {
        this.loadGroups();
    }

    loadGroups(): void {
        this.http.get<any[]>('http://localhost:8089/api/groups').subscribe(res => {
            this.groups = res;
        });
    }


    addGroup(): void {
        if (this.groupForm.invalid) {
            Swal.fire('Error', 'Please fill all required fields', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('specialite', this.groupForm.get('specialite')?.value);
        formData.append('niveau', this.groupForm.get('niveau')?.value);

        const trainers = this.groupForm.get('trainerIds')?.value || [];
        trainers.forEach((id: number) => formData.append('trainerIds', id.toString()));

        const students = this.groupForm.get('studentIds')?.value || [];
        students.forEach((id: number) => formData.append('studentIds', id.toString()));

        this.http.post('http://localhost:8089/api/groups/add', formData).subscribe((res: any) => {
            Swal.fire('Success', `Group ${res.nom} created successfully!`, 'success');
            this.groupForm.reset();
            this.loadGroups();
        });
    }


    deleteGroup(id: number): void {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will delete the group permanently.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(result => {
            if (result.isConfirmed) {
                this.http.delete(`http://localhost:8089/api/groupes/${id}`).subscribe(() => {
                    Swal.fire('Deleted!', 'The group has been deleted.', 'success');
                    this.loadGroups();
                });
            }
        });
    }
}
