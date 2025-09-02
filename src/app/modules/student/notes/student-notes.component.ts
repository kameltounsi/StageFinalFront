// src/app/modules/student/notes/student-notes.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StudentNotesApi, StudentNoteDTO } from './student-notes.api'; // <-- adapte le chemin si besoin

@Component({
    selector: 'app-student-notes',
    standalone: true,
    templateUrl: './student-notes.component.html',
    styleUrls: ['./student-notes.component.css'],
    imports: [
        CommonModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
    ],
})
export class StudentNotesComponent implements OnInit {
    private api = inject(StudentNotesApi);

    // état UI
    loading = signal(false);

    // données
    rows: StudentNoteDTO[] = [];
    /** liste des matières présentes dans les notes (pour le filtre) */
    matieres: string[] = [];
    /** valeur du filtre ('' = toutes) */
    selectedMatiere: string = '';

    ngOnInit(): void {
        this.reload();
    }

    /** recharge depuis l’API et reconstruit la liste des matières */
    reload(): void {
        this.loading.set(true);
        this.api.getMyNotes().subscribe({
            next: (rows) => {
                this.rows = Array.isArray(rows) ? rows : [];
                this.matieres = Array.from(new Set(this.rows.map(r => r.matiere))).sort((a, b) => a.localeCompare(b));
                // si la matière sélectionnée n’existe plus, on reset
                if (this.selectedMatiere && !this.matieres.includes(this.selectedMatiere)) {
                    this.selectedMatiere = '';
                }
            },
            error: () => { this.rows = []; this.matieres = []; },
            complete: () => this.loading.set(false),
        });
    }

    /** utilisé par *ngFor */
    trackByMatiere = (_: number, r: StudentNoteDTO) => r.matiere;

    /** renvoie une classe selon la valeur (pour colorer les chips) */
    gradeClass(v: number | null | undefined, isAverage = false): string {
        if (v == null) { return ''; }
        // seuils simples : <10 faible, 10–14 moyen, >=14 bon
        if (v < 10)  { return 'sn-grade-low'; }
        if (v < 14)  { return 'sn-grade-mid'; }
        return 'sn-grade-good';
    }

    /** getter pratique si tu veux filtrer côté TS (le template peut aussi filtrer directement) */
    get displayedRows(): StudentNoteDTO[] {
        if (!this.selectedMatiere) return this.rows;
        return this.rows.filter(r => r.matiere === this.selectedMatiere);
    }
}
