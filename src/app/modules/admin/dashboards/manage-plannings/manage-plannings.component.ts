import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule }    from '@angular/material/select';
import { MatInputModule }     from '@angular/material/input';
import { MatButtonModule }    from '@angular/material/button';
import { MatIconModule }      from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';

import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

import { EmploiTempsService, EmploiTempsPayload } from './emploi-temps.service';

interface Groupe { id: number; nom: string; specialite: string; }
interface Trainer { id: number; fullName: string; }

@Component({
    selector: 'app-manage-plannings',
    standalone: true,
    templateUrl: './manage-plannings.component.html',
    styleUrls: ['./manage-plannings.component.css'],
    imports: [
        CommonModule, FormsModule,
        MatFormFieldModule, MatSelectModule, MatInputModule,
        MatButtonModule, MatIconModule,
        MatDatepickerModule, MatNativeDateModule,
        NgxMaterialTimepickerModule
    ],
    providers: [{ provide: MAT_DATE_LOCALE, useValue: 'fr-FR' }]
})
export class ManagePlanningsComponent implements OnInit {

    groupes: Groupe[] = [];
    trainers: Trainer[] = [];
    emplois: any[] = [];

    selectedGroupeId?: number;
    selectedTrainerId?: number;

    // Form model
    today: Date = new Date(new Date().setHours(0, 0, 0, 0));
    date: Date | null = null;
    heureDebut = '';
    heureFin = '';
    matiere = '';
    salle = '';

    constructor(private http: HttpClient, private emploisService: EmploiTempsService) {}

    ngOnInit(): void { this.loadGroupes(); }

    // ---------- Data ----------
    loadGroupes(): void {
        this.http.get<Groupe[]>('/api/groups').subscribe(res => this.groupes = res);
    }

    onGroupeChange(): void {
        if (!this.selectedGroupeId) return;

        this.http.get<Trainer[]>(`/api/auth/trainers/by-groupe/${this.selectedGroupeId}`)
            .subscribe(res => this.trainers = res);

        this.emploisService.getByGroupe(this.selectedGroupeId)
            .subscribe(res => this.emplois = res);
    }

    // ---------- Utils ----------
    private pad(n: number) { return String(n).padStart(2, '0'); }

    private toApiDate(d: Date): string {
        return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`;
    }

    private toMinutes(hhmm: string): number {
        const [h, m] = hhmm.split(':').map(Number);
        return h * 60 + m;
    }

    // Accepts "6:30 AM", "6:30PM", or "06:30" -> returns "HH:mm"
    private to24h(t: string): string {
        if (!t) return t;
        const m = t.trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i);
        if (!m) return t; // assume already HH:mm
        let h = parseInt(m[1], 10);
        const min = m[2];
        const mer = m[3]?.toUpperCase();
        if (mer) {
            if (mer === 'PM' && h < 12) h += 12;
            if (mer === 'AM' && h === 12) h = 0;
        }
        return `${this.pad(h)}:${min}`;
    }

    // Minimum start time if selected date is today
    get minStartTime(): string | null {
        if (!this.date) return null;
        const isToday = this.date.getTime() === this.today.getTime();
        if (!isToday) return null;
        const now = new Date();
        return `${this.pad(now.getHours())}:${this.pad(now.getMinutes())}`;
    }

    onStartTimeChange(): void {
        const hd = this.to24h(this.heureDebut);
        const hf = this.to24h(this.heureFin);
        if (hd && hf && this.toMinutes(hf) <= this.toMinutes(hd)) {
            // push end 30 min after start
            const mins = this.toMinutes(hd) + 30;
            const hh = Math.floor(mins / 60) % 24;
            const mm = mins % 60;
            this.heureFin = `${this.pad(hh)}:${this.pad(mm)}`;
        }
    }

    // ---------- Actions ----------
    ajouterEmploi(): void {
        if (!this.selectedGroupeId || !this.selectedTrainerId || !this.date ||
            !this.heureDebut || !this.heureFin || !this.matiere || !this.salle) {
            Swal.fire('⚠️ Attention', 'Veuillez remplir tous les champs', 'warning'); return;
        }

        if (this.date < this.today) {
            Swal.fire('⚠️ Date invalide', 'La date ne peut pas être dans le passé.', 'warning'); return;
        }

        const hd = this.to24h(this.heureDebut);
        const hf = this.to24h(this.heureFin);

        if (this.date.getTime() === this.today.getTime() && this.minStartTime &&
            this.toMinutes(hd) < this.toMinutes(this.minStartTime)) {
            Swal.fire('⚠️ Horaire invalide', 'L’heure de début ne peut pas être dans le passé (aujourd’hui).', 'warning'); return;
        }

        if (this.toMinutes(hf) <= this.toMinutes(hd)) {
            Swal.fire('⚠️ Horaire invalide', 'L’heure de fin doit être après l’heure de début.', 'warning'); return;
        }

        const payload: EmploiTempsPayload = {
            date: this.toApiDate(this.date),
            heureDebut: hd,   // always HH:mm
            heureFin: hf,     // always HH:mm
            salle: this.salle,
            matiere: this.matiere,
            formateur: { id: this.selectedTrainerId! }
        };

        this.emploisService.add(this.selectedGroupeId, payload).subscribe({
            next: () => {
                Swal.fire('✅ Succès', 'Emploi ajouté avec succès', 'success');
                this.onGroupeChange();
                // reset form
                this.date = null; this.heureDebut = ''; this.heureFin = ''; this.matiere = ''; this.salle = '';
            },
            error: (err) => {
                Swal.fire('❌ Erreur', err?.error?.message || 'Impossible d’ajouter l’emploi', 'error');
            }
        });
    }

    supprimerEmploi(id?: number): void {
        if (!id) return;
        Swal.fire({ icon: 'question', title: 'Supprimer cet emploi ?', showCancelButton: true })
            .then(r => {
                if (!r.isConfirmed) return;
                this.emploisService.delete(id).subscribe({
                    next: () => { Swal.fire('🗑️ Supprimé', 'Emploi supprimé', 'success'); this.onGroupeChange(); },
                    error: (err) => {
                        Swal.fire('❌ Erreur', err?.error?.message || 'Suppression impossible', 'error');
                    }
                });
            });
    }
}
