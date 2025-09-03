// src/app/modules/trainer/courses/trainer-courses.routes.ts
import { Routes } from '@angular/router';
import { TrainerCoursesComponent } from './trainer-courses.component';

export const trainerCoursesRoutes: Routes = [
    {
        path: '',
        component: TrainerCoursesComponent,
        title: 'Trainer – Courses',
    },
];
