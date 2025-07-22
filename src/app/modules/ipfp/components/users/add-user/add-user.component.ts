import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
//import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../service/user.service';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {formatDate, NgIf} from '@angular/common';
import {MatIcon} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    MatIcon,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    RouterLink,
    MatDialogModule,
    NgIf
  ],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent {

}