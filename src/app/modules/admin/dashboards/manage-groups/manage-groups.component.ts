import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatCard, MatCardActions, MatCardContent, MatCardHeader} from "@angular/material/card";
import {NgForOf, NgIf} from "@angular/common";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";
import {MatPaginator} from "@angular/material/paginator";

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
        MatInput,
        MatIcon,
        MatCardHeader,
        MatIconButton,
        NgIf,
        MatPaginator,
        FormsModule
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

   /* groupedGroups: { [key: string]: any[] } = {};

    loadGroups(): void {
        this.http.get<any[]>('http://localhost:8089/api/groups').subscribe(res => {
            this.groups = res;

            // Organiser par spécialité
            this.groupedGroups = {};
            this.groups.forEach(group => {
                if (!this.groupedGroups[group.specialite]) {
                    this.groupedGroups[group.specialite] = [];
                }
                this.groupedGroups[group.specialite].push(group);
            });

            // Trier chaque spécialité : Niveau A avant Niveau B
            Object.keys(this.groupedGroups).forEach(specialite => {
                this.groupedGroups[specialite].sort((a, b) => {
                    const order = { 'A': 1, 'B': 2 };
                    const nivA = a.niveau || '';
                    const nivB = b.niveau || '';

                    // Comparer par niveau
                    if (order[nivA] < order[nivB]) return -1;
                    if (order[nivA] > order[nivB]) return 1;

                    // Si même niveau, comparer par nom (pour "A" vs "A 2")
                    return a.nom.localeCompare(b.nom, undefined, { numeric: true });
                });
            });
        });
    }
*/
    displayedGroups: any[] = [];
    pageSize = 6; // 6 groupes par page (par ex.)
    currentPage = 0;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    loadGroups(): void {
        this.http.get<any[]>('http://localhost:8089/api/groups').subscribe(res => {
            this.groups = res;

            // Trier : par specialité puis par niveau
            this.groups.sort((a, b) => {
                const specCompare = a.specialite.localeCompare(b.specialite);
                if (specCompare !== 0) return specCompare;

                const order = { 'A': 1, 'B': 2 };
                const nivA = a.niveau || '';
                const nivB = b.niveau || '';
                if (order[nivA] < order[nivB]) return -1;
                if (order[nivA] > order[nivB]) return 1;

                return a.nom.localeCompare(b.nom, undefined, { numeric: true });
            });

            this.updatePagination();
        });
    }

    groupedGroups: { [key: string]: any[] } = {};

    updatePagination(): void {
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageGroups = this.groups.slice(startIndex, endIndex);

        // Regrouper les groupes affichés (pagés) par spécialité
        this.groupedGroups = {};
        pageGroups.forEach(group => {
            if (!this.groupedGroups[group.specialite]) {
                this.groupedGroups[group.specialite] = [];
            }
            this.groupedGroups[group.specialite].push(group);
        });
    }


    onPageChange(event: any): void {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.updatePagination();
    }

/*
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

            // Recharger tous les groupes
            this.http.get<any[]>('http://localhost:8089/api/groups').subscribe(groups => {
                this.groups = groups;
                // Réappliquer les filtres actuels
                this.applyFilters();
            });
        });
    }
*/
    addGroup(): void {
        if (this.groupForm.invalid) {
            Swal.fire('Error', 'Please fill all required fields', 'error');
            return;
        }

        const specialite = this.groupForm.get('specialite')?.value;
        const niveau = this.groupForm.get('niveau')?.value;

        // Générer un nom unique pour le groupe
        const nom = this.generateGroupName(specialite, niveau);

        const formData = new FormData();
        formData.append('specialite', specialite);
        formData.append('niveau', niveau);
        formData.append('nom', nom);

        const trainers = this.groupForm.get('trainerIds')?.value || [];
        trainers.forEach((id: number) => formData.append('trainerIds', id.toString()));

        const students = this.groupForm.get('studentIds')?.value || [];
        students.forEach((id: number) => formData.append('studentIds', id.toString()));

        this.http.post('http://localhost:8089/api/groups/add', formData).subscribe((res: any) => {
            Swal.fire('Success', `Group ${res.nom} created successfully!`, 'success');
            this.groupForm.reset();

            // Recharger et réappliquer les filtres
            this.http.get<any[]>('http://localhost:8089/api/groups').subscribe(groups => {
                this.groups = groups;
                this.applyFilters();
            });
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
                this.http.delete(`http://localhost:8089/api/groups/${id}`).subscribe(() => {
                    Swal.fire('Deleted!', 'The group has been deleted.', 'success');
                    this.loadGroups();
                });
            }
        });
    }

    protected readonly Object = Object;
    searchTerm: string = '';

    applySearch(): void {
        const term = this.searchTerm.toLowerCase().trim();

        if (!term) {
            // si rien tapé → afficher tout
            this.updatePagination();
            return;
        }

        const filteredGroups = this.groups.filter(group =>
            group.specialite.toLowerCase().includes(term) ||
            group.nom.toLowerCase().includes(term)
        );

        // Recréer groupedGroups avec les résultats filtrés
        this.groupedGroups = {};
        filteredGroups.forEach(group => {
            if (!this.groupedGroups[group.specialite]) {
                this.groupedGroups[group.specialite] = [];
            }
            this.groupedGroups[group.specialite].push(group);
        });
    }
    selectedSpecialite: string = '';

    filterBySpecialite(): void {
        if (!this.selectedSpecialite) {
            // si aucune spécialité sélectionnée → afficher tout
            this.updatePagination();
            return;
        }

        const filteredGroups = this.groups.filter(group =>
            group.specialite === this.selectedSpecialite
        );

        // Regrouper les groupes filtrés par spécialité
        this.groupedGroups = {};
        filteredGroups.forEach(group => {
            if (!this.groupedGroups[group.specialite]) {
                this.groupedGroups[group.specialite] = [];
            }
            this.groupedGroups[group.specialite].push(group);
        });
    }

    applyFilters(): void {
        let filteredGroups = this.groups;

        // Filtrer par spécialité si sélectionnée
        if (this.selectedSpecialite) {
            filteredGroups = filteredGroups.filter(group =>
                group.specialite === this.selectedSpecialite
            );
        }

        // Filtrer par nom si texte saisi
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filteredGroups = filteredGroups.filter(group =>
                group.nom.toLowerCase().includes(term)
            );
        }

        // Regrouper les résultats filtrés
        this.groupedGroups = {};
        filteredGroups.forEach(group => {
            if (!this.groupedGroups[group.specialite]) {
                this.groupedGroups[group.specialite] = [];
            }
            this.groupedGroups[group.specialite].push(group);
        });
    }
    generateGroupName(specialite: string, niveau: string): string {
        // Filtrer les groupes de la même spécialité et du même niveau
        const sameGroups = this.groups.filter(
            g => g.specialite === specialite && g.niveau === niveau
        );

        if (sameGroups.length === 0) {
            // Premier groupe → "DM A"
            return `${this.getShortCode(specialite)} ${niveau}`;
        }

        // Extraire les suffixes numériques (A, A 2, A 3…)
        const regex = new RegExp(`^${this.getShortCode(specialite)} ${niveau}(?: (\\d+))?$`);
        const suffixes = sameGroups
            .map(g => {
                const match = g.nom.match(regex);
                return match && match[1] ? parseInt(match[1], 10) : 1;
            });

        // Prendre le max + 1
        const nextNumber = Math.max(...suffixes) + 1;

        return nextNumber === 1
            ? `${this.getShortCode(specialite)} ${niveau}`
            : `${this.getShortCode(specialite)} ${niveau} ${nextNumber}`;
    }

// Raccourci pour les spécialités (ex: "Digital Marketing & Social Media Management" -> "DM")
    getShortCode(specialite: string): string {
        return specialite
            .split(' ')
            .map(word => word[0].toUpperCase())
            .join('')
            .slice(0, 2); // exemple : 2 lettres max
    }

}
