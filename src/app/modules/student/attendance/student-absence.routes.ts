// src/app/modules/student/attendance/student-absence.routes.ts
import { Routes } from '@angular/router';
import { StudentAbsenceComponent } from './student-absence.component';

export const studentAbsenceRoutes: Routes = [
    {
        path: '',
        component: StudentAbsenceComponent,
        // Si tu veux protéger l’accès, ajoute ton guard :
        // canActivate: [AuthGuard], data: { roles: ['STUDENT'] }
    }
];
