// src/app/modules/auth/reset-flow/reset-flow.module.ts
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ResetFlowComponent } from './reset-flow.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        RouterModule.forChild([
            {
                path: '',
                component: ResetFlowComponent,
            },
        ]),
        ResetFlowComponent,
    ],
})
export class ResetFlowModule {}
