// app/modules/student/consult-planning/consult-planning.routes.ts
import { Route } from '@angular/router';
import { ConsultPlanningComponent } from './consult-planning.component';

export const consultPlanningRoutes: Route[] = [
    {
        path: '',
        component: ConsultPlanningComponent,
        title: 'My Schedule'
    }
];
