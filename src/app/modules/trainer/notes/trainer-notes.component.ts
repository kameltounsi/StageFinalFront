import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { TrainerNotesApi, SaveNotesRequest, TrainerNoteRow } from './trainer-notes.api';
import Swal from 'sweetalert2';

type Groupe = { id: number; nom: string; specialite: string };

type GradeRow = {
    studentId: FormControl<number>;
    studentName: FormControl<string>;
    studentEmail: FormControl<string>;
    cc: FormControl<number | null>;
    examen: FormControl<number | null>;
    moyenne: FormControl<number | null>;
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
    subjects: string[] = []; // filtered by specialty
    loading = signal(false);
    saving = signal(false);

    // '40_60' or '20_80'
    weightMode = this.fb.control<'40_60' | '20_80'>('40_60', { nonNullable: true });

    form = this.fb.group({
        groupeId: this.fb.control<number | null>(null, Validators.required),
        matiere: this.fb.control<string>({ value: '', disabled: true }, Validators.required),
        rows: this.fb.array<FormGroup<GradeRow>>([]),
    });

    // Mapping Speciality -> Allowed subjects
    readonly MATIERES_PAR_SPECIALITE: Record<string, string[]> = {
        'Cybersecurity & Ethical Hacking': [
            'Réseaux & Protocoles Sécurisés',
            'Tests d’intrusion (Pentest)',
            'Gestion des vulnérabilités',
        ],
        'Web Development': [
            'Frontend (Angular/React)',
            'Backend (Spring/Node)',
            'Bases de données & SQL',
        ],
        'Mobile Application Development': [
            'Android (Kotlin/Java)',
            'iOS (SwiftUI)',
            'Cross-platform (Flutter)',
        ],
        'Graphic Design & Multimedia': ['Design UI/UX', 'Suite Adobe (PS/AI/PR)', 'Motion Graphics'],
        'Digital Marketing & Social Media Management': [
            'Stratégie Social Media',
            'SEO/SEA & Analytics',
            'Content Marketing',
        ],
        'Electrical Installation & Building Wiring': [
            'Schémas & Normes électriques',
            'Tableaux & Protections',
            'Dépannage & sécurité',
        ],
        'Plumbing & Sanitary Installations': [
            'Réseaux d’eau & évacuation',
            'Matériaux & raccords',
            'Maintenance & étanchéité',
        ],
        'Masonry & Concrete Works': ['Matériaux & dosages béton', 'Coffrage & ferraillage', 'Techniques de maçonnerie'],
        'Carpentry & Woodworking': ['Conception & traçage', 'Assemblages & usinage', 'Finition & sécurité'],
        'HVAC Systems': ['Thermodynamique appliquée', 'Climatisation & froid', 'Chauffage & ventilation'],
        'Accounting & Financial Management': ['Comptabilité générale', 'Analyse financière', 'Fiscalité & TVA'],
        'Human Resources Management': ['Recrutement & onboarding', 'Droit du travail', 'GPEC & formation'],
        'Office Administration & Secretarial Studies': ['Bureautique avancée', 'Gestion documentaire', 'Communication professionnelle'],
        'Sales & Commercial Techniques': ['Techniques de vente', 'Négociation & CRM', 'Merchandising'],
        'Logistics & Supply Chain Management': ['Gestion des stocks', 'Transport & douane', 'Planification (MRP/DRP)'],
    };

    get rows(): FormArray<FormGroup<GradeRow>> {
        return this.form.controls.rows;
    }

    ngOnInit(): void {
        this.fetchGroupsForTrainer();
        // recompute all averages when weight mode changes
        this.weightMode.valueChanges.subscribe(() => this.recomputeAllAverages());
    }

    trackByIndex = (i: number) => i;

    private fetchGroupsForTrainer(): void {
        this.http.get<Groupe[]>('/api/trainer/my-groups').subscribe({
            next: (gs) => (this.groups = gs ?? []),
            error: () => (this.groups = []),
        });
    }

    onGroupChanged(groupeId: number | null) {
        // reset
        this.rows.clear();
        this.subjects = [];
        this.form.controls.matiere.setValue('');
        this.form.controls.matiere.disable();

        if (!groupeId) return;

        const g = this.groups.find((x) => x.id === groupeId);
        const spec = g?.specialite ?? '';
        this.subjects = this.MATIERES_PAR_SPECIALITE[spec] ?? [];

        if (this.subjects.length) {
            this.form.controls.matiere.enable();
        }
    }

    private getWeights(): { wCc: number; wExam: number } {
        return this.weightMode.value === '20_80' ? { wCc: 0.2, wExam: 0.8 } : { wCc: 0.4, wExam: 0.6 };
    }

    private clamp20(v: number | null | undefined): number | null {
        if (v == null) return null;
        return Math.max(0, Math.min(20, v));
    }

    private computeAverage(cc: number | null, ex: number | null): number | null {
        const { wCc, wExam } = this.getWeights();
        const ccS = this.clamp20(cc);
        const exS = this.clamp20(ex);
        if (ccS == null && exS == null) return null;
        if (ccS == null) return exS!;
        if (exS == null) return ccS;
        return +(ccS * wCc + exS * wExam).toFixed(2);
    }

    /** Ensures 0..20, clamps if out of range and shows a SweetAlert */
    private enforceBoundsWithAlert(label: 'CC' | 'Exam', value: number | null | undefined): number | null {
        if (value == null || Number.isNaN(value as any)) return null;

        if (value < 0 || value > 20) {
            const clamped = Math.max(0, Math.min(20, value));
            Swal.fire({
                icon: 'warning',
                title: 'Value out of bounds',
                text: `${label} must be between 0 and 20. The value has been adjusted to ${clamped}.`,
                confirmButtonText: 'OK',
            });
            return clamped;
        }
        return value;
    }

    /** Called on blur of CC/Exam: clamp + recompute average */
    onNoteBlur(row: FormGroup<GradeRow>, key: 'cc' | 'examen') {
        const ctrl = row.controls[key];
        const fixed = this.enforceBoundsWithAlert(key === 'cc' ? 'CC' : 'Exam', ctrl.value);
        if (fixed !== ctrl.value) {
            ctrl.setValue(fixed, { emitEvent: false });
        }
        // Immediate recompute
        row.controls.moyenne.setValue(this.computeAverage(row.controls.cc.value, row.controls.examen.value), {
            emitEvent: false,
        });
    }

    /** Auto-recompute (no alert) while typing */
    private bindRowRecalc(row: FormGroup<GradeRow>): void {
        row.controls.cc.valueChanges.subscribe(() => {
            row.controls.moyenne.setValue(this.computeAverage(row.controls.cc.value, row.controls.examen.value), {
                emitEvent: false,
            });
        });
        row.controls.examen.valueChanges.subscribe(() => {
            row.controls.moyenne.setValue(this.computeAverage(row.controls.cc.value, row.controls.examen.value), {
                emitEvent: false,
            });
        });
    }

    private recomputeAllAverages(): void {
        this.rows.controls.forEach((r) => {
            r.controls.moyenne.setValue(this.computeAverage(r.controls.cc.value, r.controls.examen.value), {
                emitEvent: false,
            });
        });
    }

    loadSheet(): void {
        if (this.form.invalid) return;

        const groupeId = this.form.controls.groupeId.value!;
        const matiere = (this.form.controls.matiere.value || '').trim();
        if (!groupeId || !matiere) return;

        this.loading.set(true);
        this.rows.clear();

        this.api.loadSheet(groupeId, matiere).subscribe({
            next: (rows: TrainerNoteRow[]) => {
                (rows || []).forEach((r) => {
                    const row = this.fb.group<GradeRow>({
                        studentId: this.fb.control(r.studentId, { nonNullable: true }),
                        studentName: this.fb.control(r.studentName, { nonNullable: true }),
                        studentEmail: this.fb.control(r.studentEmail, { nonNullable: true }),
                        cc: this.fb.control(r.cc ?? null, { validators: [Validators.min(0), Validators.max(20)] }),
                        examen: this.fb.control(r.examen ?? null, { validators: [Validators.min(0), Validators.max(20)] }),
                        moyenne: this.fb.control(r.moyenne ?? null),
                        commentaire: this.fb.control<string | null>(null),
                    });
                    this.bindRowRecalc(row);
                    this.rows.push(row);
                });
                this.recomputeAllAverages();
            },
            error: () => {
                /* silent */
            },
            complete: () => this.loading.set(false),
        });
    }

    save(): void {
        if (this.form.invalid || !this.rows.length) return;
        this.saving.set(true);

        const { wCc, wExam } = this.getWeights();

        const body: SaveNotesRequest = {
            groupeId: this.form.controls.groupeId.value!,
            matiere: this.form.controls.matiere.value!,
            weightCc: wCc,
            weightExam: wExam,
            items: this.rows.getRawValue().map((r) => ({
                studentId: r.studentId,
                cc: r.cc,
                examen: r.examen,
                commentaire: (r.commentaire ?? '') || null,
            })),
        };

        this.api.saveSheet(body).subscribe({
            next: () => Swal.fire('Success', 'Grades have been saved.', 'success'),
            error: () => Swal.fire('Error', 'Saving grades failed.', 'error'),
            complete: () => this.saving.set(false),
        });
    }
}
