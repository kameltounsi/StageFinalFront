import {
    Component, OnInit, inject, signal,
} from '@angular/core';
import {
    FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { TrainerNotesApi, SaveNotesRequest, TrainerNoteRow } from './trainer-notes.api';

type Groupe = { id: number; nom: string };

type GradeRow = {
    studentId: FormControl<number>;
    studentName: FormControl<string>;
    studentEmail: FormControl<string>;
    valeur: FormControl<number | null>;
    commentaire: FormControl<string | null>;
};

@Component({
    selector: 'app-trainer-notes',
    standalone: true,
    templateUrl: './trainer-notes.component.html',
    styleUrls: ['./trainer-notes.component.css'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
    ],
})
export class TrainerNotesComponent implements OnInit {

    private fb = inject(FormBuilder);
    private http = inject(HttpClient);
    private api = inject(TrainerNotesApi);

    groups: Groupe[] = [];
    loading = signal(false);
    saving = signal(false);

    /** Form principal */
    form = this.fb.group({
        // IMPORTANT: "groupeId" (conforme au backend)
        groupeId: this.fb.control<number | null>(null, Validators.required),
        matiere: this.fb.control<string>('', Validators.required),
        date: this.fb.control<string>('', Validators.required), // yyyy-MM-dd (string)
        rows: this.fb.array<FormGroup<GradeRow>>([]),
    });

    get rows(): FormArray<FormGroup<GradeRow>> {
        return this.form.controls.rows;
    }

    ngOnInit(): void {
        this.fetchGroupsForTrainer();
    }

    /** trackBy simple pour *ngFor */
    trackByIndex = (index: number) => index;

    /** Récupère les groupes du formateur */
    private fetchGroupsForTrainer(): void {
        this.http.get<Groupe[]>('/api/trainer/my-groups').subscribe({
            next: (gs) => (this.groups = gs ?? []),
            error: () => (this.groups = []),
        });
    }

    /** Charge la feuille pour groupe + matière + date */
    loadSheet(): void {
        if (this.form.invalid) return;

        const groupeId = this.form.controls.groupeId.value!;
        const matiere = (this.form.controls.matiere.value || '').trim();
        const date = this.form.controls.date.value!; // garder tel quel (yyyy-MM-dd)

        if (!groupeId || !matiere || !date) return;

        this.loading.set(true);
        this.rows.clear();

        // Appel du service aligné avec le backend: /api/trainer/notes/sheet
        this.api.loadSheet(groupeId, matiere, date).subscribe({
            next: (rows: TrainerNoteRow[]) => {
                (rows || []).forEach((r) => {
                    this.rows.push(
                        this.fb.group<GradeRow>({
                            studentId: this.fb.control(r.studentId, { nonNullable: true }),
                            studentName: this.fb.control(r.studentName, { nonNullable: true }),
                            studentEmail: this.fb.control(r.studentEmail, { nonNullable: true }),
                            valeur: this.fb.control(
                                r.valeur ?? null,
                                { validators: [Validators.min(0), Validators.max(20)] }
                            ),
                            commentaire: this.fb.control(r.commentaire ?? null),
                        })
                    );
                });
            },
            error: () => {},
            complete: () => this.loading.set(false),
        });
    }

    /** Sauvegarde toutes les notes affichées */
    save(): void {
        if (this.form.invalid || !this.rows.length) return;

        this.saving.set(true);

        const body: SaveNotesRequest = {
            // clé attendue par le back (JsonAlias gère aussi groupId si besoin)
            groupeId: this.form.controls.groupeId.value!,
            matiere: this.form.controls.matiere.value!,
            date: this.form.controls.date.value!, // string yyyy-MM-dd
            items: this.rows.getRawValue().map((r) => ({
                studentId: r.studentId,
                valeur: r.valeur,
                commentaire: (r.commentaire ?? '') || null,
            })),
        };

        // Appel du service aligné avec le backend: /api/trainer/notes/bulk
        this.api.saveSheet(body).subscribe({
            next: () => alert('Notes saved ✅'),
            error: (e) => { console.error(e); alert('Save failed ❌'); },
            complete: () => this.saving.set(false),
        });
    }
}
