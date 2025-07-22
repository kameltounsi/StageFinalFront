import {Component, OnInit} from '@angular/core';
import {UserService} from "../../../service/user.service";
import {MatIcon} from "@angular/material/icon";
import {MatDrawerContainer} from "@angular/material/sidenav";
import {MatTooltip} from "@angular/material/tooltip";
import {NgForOf, NgIf} from "@angular/common";
import {UserModel} from "../../../models/user.model";

@Component({
  selector: 'app-list-users',
  standalone: true,
  imports: [
    MatIcon,
    MatDrawerContainer,
    MatTooltip,
    NgForOf,
    NgIf
  ],
  templateUrl: './list-users.component.html',
  styleUrl: './list-users.component.scss'
})
export class ListUsersComponent{

}