import { Routes } from '@angular/router';
import { MaterialComponentsComponent } from 'app/modules/admin/ui/material-components/material-components.component';
import {AddUserComponent} from "./add-user.component";

export default [
    {
        path: '',
        component: AddUserComponent,
    },
] as Routes;
