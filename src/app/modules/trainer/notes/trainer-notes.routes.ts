import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () =>
            import('./trainer-notes.component').then(m => m.TrainerNotesComponent),
    },
] as Routes;
