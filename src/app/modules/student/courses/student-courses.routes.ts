// src/app/modules/student/courses/student-courses.routes.ts
import { Routes } from '@angular/router';
import { StudentRoomsComponent } from './student-rooms.component';
import { StudentCoursesComponent } from './student-courses.component';

export default [
    {
        path: '',
        component: StudentRoomsComponent,
    },
    {
        path: ':subject',
        component: StudentCoursesComponent,
    },
] as Routes;
