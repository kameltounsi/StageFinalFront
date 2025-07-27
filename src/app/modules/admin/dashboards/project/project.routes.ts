import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';

export default [
    {
        path: '',
        loadComponent: () =>
            import('./project.component').then(m => m.ProjectComponent),
        resolve: {
            data: () => inject(ProjectService).getData(),
        },
    },
] as Routes;
