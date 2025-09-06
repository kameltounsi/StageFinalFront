// src/app/modules/trainer-dashboard/trainer-dashboard.routes.ts
import { Routes } from '@angular/router';

/**
 * Lazy routes for the Trainer Dashboard feature.
 *
 * Hook it up from your app routes like:
 * {
 *   path: 'trainer',
 *   loadChildren: () =>
 *     import('./modules/trainer-dashboard/trainer-dashboard.routes')
 *       .then(m => m.routes)
 * }
 *
 * If you have a role/auth guard, you can plug it in via `canActivate` (see commented code).
 */
export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        title: 'Trainer Dashboard',
        // Standalone component lazy-load
        loadComponent: () =>
            import('./trainer-dashboard.component')
                .then(m => m.TrainerDashboardComponent),

        // Optional: restrict to TRAINER/ADMIN with your own guard
        // canActivate: [trainerOnlyGuard],
        // data: { roles: ['TRAINER', 'ADMIN'] },
    },
];

export default routes;
