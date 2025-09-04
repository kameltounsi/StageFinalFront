// src/app/modules/admin/results/admin-results.routes.ts
import { Routes } from '@angular/router';

export const ADMIN_RESULTS_ROUTES: Routes = [
    {
        path: '',
        title: 'Admin — Résultats & Passage',
        loadComponent: () =>
            import('./admin-results.component').then(m => m.AdminResultsComponent),
    }
];
