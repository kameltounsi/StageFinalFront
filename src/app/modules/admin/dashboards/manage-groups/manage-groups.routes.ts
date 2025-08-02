import { Routes } from '@angular/router';
import { ManageGroupsComponent } from './manage-groups.component';

export default [
    {
        path: '',
        component: ManageGroupsComponent,
        data: {
            title: 'Manage Groups'
        }
    }
] as Routes;
