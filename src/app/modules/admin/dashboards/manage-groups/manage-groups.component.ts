import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatOption, MatSelect } from "@angular/material/select";
import { MatCard, MatCardActions, MatCardContent, MatCardHeader } from "@angular/material/card";
import { NgForOf, NgIf } from "@angular/common";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatInput } from "@angular/material/input";
import { MatIcon } from "@angular/material/icon";
import { MatPaginator } from "@angular/material/paginator";
import { MatDialog } from '@angular/material/dialog';
import { ManageMembersDialogComponent } from './manage-members-dialog/manage-members-dialog.component';

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

    displayedGroups: any[] = [];
    pageSize = 6;
    currentPage = 0;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    groupedGroups: { [key: string]: any[] } = {};
    protected readonly Object = Object;

    searchTerm: string = '';
    selectedSpecialite: string = '';

    constructor(
        private fb: FormBuilder,
        private http: HttpClient,
        private dialog: MatDialog
    ) {
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

            // Tri : par spécialité puis par niveau déduit du nom, puis par nom
            this.groups.sort((a, b) => {
                const specCompare = a.specialite.localeCompare(b.specialite);
                if (specCompare !== 0) return specCompare;

                const order: any = { 'A': 1, 'B': 2 };
                const nivA = this.extractLevel(a.nom);
                const nivB = this.extractLevel(b.nom);
                if ((order[nivA] ?? 99) < (order[nivB] ?? 99)) return -1;
                if ((order[nivA] ?? 99) > (order[nivB] ?? 99)) return 1;

                return a.nom.localeCompare(b.nom, undefined, { numeric: true });
            });

            this.updatePagination();
        });
    }

    private extractLevel(nom: string): 'A' | 'B' | '' {
        if (!nom) return '';
        // Exemples: "WD A", "WD A 2"
        if (nom.includes(' A')) return 'A';
        if (nom.includes(' B')) return 'B';
        return '';
    }

    updatePagination(filteredGroups: any[] = this.groups): void {
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageGroups = filteredGroups.slice(startIndex, endIndex);

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

    openManageMembersDialog(group: any): void {
        this.dialog.open(ManageMembersDialogComponent, {
            width: '90vw',
            height: '85vh',
            maxWidth: '1200px',
            panelClass: 'custom-dialog-container',
            data: { group }
        }).afterClosed().subscribe(() => {
            // rafraîchir pour voir les changements
            this.loadGroups();
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
                    this.http.get<any[]>('http://localhost:8089/api/groups').subscribe(groups => {
                        this.groups = groups;
                        this.applyFilters();
                    });
                });
            }
        });
    }

    applySearch(): void {
        const term = this.searchTerm.toLowerCase().trim();

        if (!term) {
            this.updatePagination();
            return;
        }

        const filteredGroups = this.groups.filter(group =>
            (group.specialite || '').toLowerCase().includes(term) ||
            (group.nom || '').toLowerCase().includes(term)
        );

        this.groupedGroups = {};
        filteredGroups.forEach(group => {
            if (!this.groupedGroups[group.specialite]) {
                this.groupedGroups[group.specialite] = [];
            }
            this.groupedGroups[group.specialite].push(group);
        });
    }

    filterBySpecialite(): void {
        if (!this.selectedSpecialite) {
            this.updatePagination();
            return;
        }

        const filteredGroups = this.groups.filter(group =>
            group.specialite === this.selectedSpecialite
        );

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

        if (this.selectedSpecialite) {
            filteredGroups = filteredGroups.filter(group =>
                group.specialite === this.selectedSpecialite
            );
        }

        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filteredGroups = filteredGroups.filter(group =>
                (group.nom || '').toLowerCase().includes(term)
            );
        }

        this.currentPage = 0;
        this.updatePagination(filteredGroups);
    }

    // ---------------------------
    // 🔀 RANDOM AFFECT UI handler
    // ---------------------------
    randomAffect(): void {
        if (!this.selectedSpecialite) {
            Swal.fire('Info', 'Choisissez d’abord une spécialité (Filter by Speciality).', 'info');
            return;
        }

        Swal.fire({
            title: '⚠️ Réinitialisation & Affectation aléatoire',
            html: `
        <div style="text-align:left">
          <p>Cette action va :</p>
          <ul>
            <li>Réinitialiser les affectations des étudiants de la spécialité <b>${this.selectedSpecialite}</b></li>
            <li>Supprimer leurs <b>présences</b> et <b>notes</b></li>
            <li>Répartir aléatoirement et équitablement sur les groupes <b>niveau A ou B</b></li>
          </ul>
        </div>
        <div style="margin-top:8px;text-align:left">
          <label for="nivSel"><b>Niveau :</b></label>
          <select id="nivSel" class="swal2-select">
            <option value="A">A</option>
            <option value="B">B</option>
          </select>
        </div>
      `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Lancer',
            cancelButtonText: 'Annuler',
            focusConfirm: false,
            preConfirm: () => {
                const el = document.getElementById('nivSel') as HTMLSelectElement;
                if (!el?.value) {
                    Swal.showValidationMessage('Choisissez un niveau (A/B)');
                }
                return { level: el.value };
            }
        }).then(result => {
            if (!result.isConfirmed) return;

            const level = result.value.level;
            const specParam = this.selectedSpecialite.trim(); // ✅ ne pas mettre en minuscule

            this.callRandomAssign(specParam, level, true).subscribe({
                next: (report: any) => {
                    this.loadGroups();
                    const lines = Object.entries(report.assignedPerGroup || {})
                        .map(([g, c]) => `<li><b>${g}</b> : ${c} étudiants</li>`).join('');
                    Swal.fire(
                        'Terminé ✅',
                        `Étudiants affectés : <b>${report.totalStudents}</b><br/>
             Groupes: <b>${report.totalGroups}</b><br/>
             <ul>${lines}</ul>`,
                        'success'
                    );
                },
                error: (err) => {
                    const msg = (err?.error?.message || err?.error || '').toString() || 'Impossible de lancer l’affectation.';
                    Swal.fire('Erreur', msg, 'error');
                }
            });
        });
    }

    // ---------------------------
    // 🔗 Appel HTTP direct (sans service)
    // ---------------------------
    private callRandomAssign(specialite: string, level: string, wipe: boolean) {
        const params = new HttpParams()
            .set('specialite', specialite)  // le backend gère la casse
            .set('level', level)
            .set('wipe', String(wipe));

        return this.http.post<any>('http://localhost:8089/api/groups/random-assign', {}, { params });
    }
}
