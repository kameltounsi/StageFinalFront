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

    // Listes dynamiques selon la spécialité du groupe
    matieresPourSpecialite: string[] = [];
    sallesPourSpecialite: string[] = [];

    constructor(private http: HttpClient, private emploisService: EmploiTempsService) {}

    // --------- Mapping Spécialité -> 3 matières ----------
    MATIERES_PAR_SPECIALITE: Record<string, string[]> = {
        "Cybersecurity & Ethical Hacking": [
            "Réseaux & Protocoles Sécurisés",
            "Tests d’intrusion (Pentest)",
            "Gestion des vulnérabilités"
        ],
        "Web Development": [
            "Frontend (Angular/React)",
            "Backend (Spring/Node)",
            "Bases de données & SQL"
        ],
        "Mobile Application Development": [
            "Android (Kotlin/Java)",
            "iOS (SwiftUI)",
            "Cross-platform (Flutter)"
        ],
        "Graphic Design & Multimedia": [
            "Design UI/UX",
            "Suite Adobe (PS/AI/PR)",
            "Motion Graphics"
        ],
        "Digital Marketing & Social Media Management": [
            "Stratégie Social Media",
            "SEO/SEA & Analytics",
            "Content Marketing"
        ],
        "Electrical Installation & Building Wiring": [
            "Schémas & Normes électriques",
            "Tableaux & Protections",
            "Dépannage & sécurité"
        ],
        "Plumbing & Sanitary Installations": [
            "Réseaux d’eau & évacuation",
            "Matériaux & raccords",
            "Maintenance & étanchéité"
        ],
        "Masonry & Concrete Works": [
            "Matériaux & dosages béton",
            "Coffrage & ferraillage",
            "Techniques de maçonnerie"
        ],
        "Carpentry & Woodworking": [
            "Conception & traçage",
            "Assemblages & usinage",
            "Finition & sécurité"
        ],
        "HVAC Systems": [
            "Thermodynamique appliquée",
            "Climatisation & froid",
            "Chauffage & ventilation"
        ],
        "Accounting & Financial Management": [
            "Comptabilité générale",
            "Analyse financière",
            "Fiscalité & TVA"
        ],
        "Human Resources Management": [
            "Recrutement & onboarding",
            "Droit du travail",
            "GPEC & formation"
        ],
        "Office Administration & Secretarial Studies": [
            "Bureautique avancée",
            "Gestion documentaire",
            "Communication professionnelle"
        ],
        "Sales & Commercial Techniques": [
            "Techniques de vente",
            "Négociation & CRM",
            "Merchandising"
        ],
        "Logistics & Supply Chain Management": [
            "Gestion des stocks",
            "Transport & douane",
            "Planification (MRP/DRP)"
        ]
    };

    // --------- Mapping Spécialité -> 5 salles (noms courts) ----------
    sallesParSpecialite: Record<string, string[]> = {
        "Cybersecurity & Ethical Hacking": ["S101", "S102", "S103", "S104", "S105"],
        "Web Development": ["S201", "S202", "S203", "S204", "S205"],
        "Mobile Application Development": ["S301", "S302", "S303", "S304", "S305"],
        "Graphic Design & Multimedia": ["S401", "S402", "S403", "S404", "S405"],
        "Digital Marketing & Social Media Management": ["S501", "S502", "S503", "S504", "S505"],
        "Electrical Installation & Building Wiring": ["E101", "E102", "E103", "E104", "E105"],
        "Plumbing & Sanitary Installations": ["P101", "P102", "P103", "P104", "P105"],
        "Masonry & Concrete Works": ["M101", "M102", "M103", "M104", "M105"],
        "Carpentry & Woodworking": ["C101", "C102", "C103", "C104", "C105"],
        "HVAC Systems": ["H101", "H102", "H103", "H104", "H105"],
        "Accounting & Financial Management": ["A101", "A102", "A103", "A104", "A105"],
        "Human Resources Management": ["HR1", "HR2", "HR3", "HR4", "HR5"],
        "Office Administration & Secretarial Studies": ["O101", "O102", "O103", "O104", "O105"],
        "Sales & Commercial Techniques": ["V101", "V102", "V103", "V104", "V105"],
        "Logistics & Supply Chain Management": ["L101", "L102", "L103", "L104", "L105"]
    };

    ngOnInit(): void { this.loadGroupes(); }

    // ---------- Data ----------
    loadGroupes(): void {
        this.http.get<Groupe[]>('/api/groups').subscribe(res => this.groupes = res);
    }

    onGroupeChange(): void {
        if (!this.selectedGroupeId) return;

        // Charger formateurs + emplois
        this.http.get<Trainer[]>(`/api/auth/trainers/by-groupe/${this.selectedGroupeId}`)
            .subscribe(res => this.trainers = res);

        this.emploisService.getByGroupe(this.selectedGroupeId)
            .subscribe(res => this.emplois = res);

        // Spécialité -> matières + salles proposées
        const g = this.groupes.find(x => x.id === this.selectedGroupeId);
        const spec = g?.specialite || '';
        this.matieresPourSpecialite = this.MATIERES_PAR_SPECIALITE[spec] || [];
        this.sallesPourSpecialite   = this.sallesParSpecialite[spec]   || [];

        // Réinitialiser si la valeur courante ne colle plus
        if (!this.matieresPourSpecialite.includes(this.matiere)) this.matiere = '';
        if (!this.sallesPourSpecialite.includes(this.salle))     this.salle   = '';
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

    // Accepte "6:30 AM", "6:30PM", ou "06:30" -> renvoie "HH:mm"
    private to24h(t: string): string {
        if (!t) return t;
        const m = t.trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i);
        if (!m) return t; // suppose déjà HH:mm
        let h = parseInt(m[1], 10);
        const min = m[2];
        const mer = m[3]?.toUpperCase();
        if (mer) {
            if (mer === 'PM' && h < 12) h += 12;
            if (mer === 'AM' && h === 12) h = 0;
        }
        return `${this.pad(h)}:${min}`;
    }

    // Min start time si la date choisie est aujourd'hui
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
            // pousse fin à +30 min
            const mins = this.toMinutes(hd) + 30;
            const hh = Math.floor(mins / 60) % 24;
            const mm = mins % 60;
            this.heureFin = `${this.pad(hh)}:${this.pad(mm)}`;
        }
    }
// --- helpers SweetAlert ---
// 1) extrait un message lisible quel que soit le format de la réponse
    private extractErrorMessage(err: any): string {
        // message JSON du backend ?
        if (err?.error && typeof err.error === 'object' && err.error.message) {
            return String(err.error.message);
        }
        // texte brut ?
        if (typeof err?.error === 'string' && err.error.trim()) {
            return err.error;
        }
        // fallback Angular
        const m = (err?.message || '').toString();
        if (m && !m.startsWith('Http failure response')) return m;

        // derniers fallbacks par status
        switch (err?.status) {
            case 400: return 'Requête invalide.';
            case 401: return 'Session expirée. Veuillez vous reconnecter.';
            case 403: return 'Accès refusé : droits insuffisants.';
            case 404: return 'Ressource introuvable.';
            case 409: return 'Conflit sur la ressource.';
            case 0:   return 'Serveur injoignable. Vérifiez votre connexion.';
            default:  return 'Une erreur est survenue.';
        }
    }

// 2) titre/icône en fonction du code HTTP
    private errorMeta(err: any): { title: string; icon: 'error'|'warning' } {
        const s = err?.status;
        if (s === 409) return { title: '⚠️ Conflit', icon: 'warning' };
        if (s === 400) return { title: '⚠️ Requête invalide', icon: 'warning' };
        if (s === 403) return { title: 'Accès refusé', icon: 'error' };
        if (s === 401) return { title: 'Authentification requise', icon: 'error' };
        if (s === 404) return { title: 'Introuvable', icon: 'error' };
        if (s === 0)   return { title: 'Réseau indisponible', icon: 'error' };
        return { title: '❌ Erreur', icon: 'error' };
    }

    // ---------- Actions ----------
    ajouterEmploi(): void {
        if (!this.selectedGroupeId || !this.selectedTrainerId || !this.date ||
            !this.heureDebut || !this.heureFin || !this.matiere || !this.salle) {
            Swal.fire('⚠️ Attention', 'Veuillez remplir tous les champs', 'warning');
            return;
        }

        if (this.date < this.today) {
            Swal.fire('⚠️ Date invalide', 'La date ne peut pas être dans le passé.', 'warning');
            return;
        }

        const hd = this.to24h(this.heureDebut);
        const hf = this.to24h(this.heureFin);

        if (this.date.getTime() === this.today.getTime() && this.minStartTime &&
            this.toMinutes(hd) < this.toMinutes(this.minStartTime)) {
            Swal.fire('⚠️ Horaire invalide', 'L’heure de début ne peut pas être dans le passé (aujourd’hui).', 'warning');
            return;
        }

        if (this.toMinutes(hf) <= this.toMinutes(hd)) {
            Swal.fire('⚠️ Horaire invalide', 'L’heure de fin doit être après l’heure de début.', 'warning');
            return;
        }

        const payload: EmploiTempsPayload = {
            date: this.toApiDate(this.date),
            heureDebut: hd,
            heureFin: hf,
            salle: this.salle,
            matiere: this.matiere,
            formateur: {id: this.selectedTrainerId!}
        };

        this.emploisService.add(this.selectedGroupeId, payload).subscribe({
            next: () => {
                Swal.fire('✅ Succès', 'Emploi ajouté avec succès', 'success');
                this.onGroupeChange();
                this.date = null;
                this.heureDebut = '';
                this.heureFin = '';
                this.matiere = '';
                this.salle = '';
            },
            error: (err) => {
                const {title, icon} = this.errorMeta(err);
                let msg = this.extractErrorMessage(err);

                // raffinements pour nos messages métier
                if (msg.includes('Salle déjà réservée')) msg = 'Cette salle est déjà réservée pour cet horaire.';
                if (msg.includes('Formateur déjà occupé')) msg = 'Ce formateur est déjà occupé pour cet horaire.';
                if (msg.includes('Horaires invalides')) msg = 'Les horaires doivent être compris entre 08:00 et 17:00.';

                Swal.fire({icon, title, text: msg});
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
