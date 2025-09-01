import { Routes } from '@angular/router';
import { AdminAbsencesComponent } from './admin-absences.component';

export const ADMIN_ABSENCES_ROUTES: Routes = [
    {
        path: '',
        component: AdminAbsencesComponent,
        data: {
            title: 'Absences Management',
            breadcrumb: 'Absences'
        }
    }
];
