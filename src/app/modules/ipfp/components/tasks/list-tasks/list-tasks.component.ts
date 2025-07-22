// list-tasks.component.ts
import { Component, OnInit } from '@angular/core';
import { TaskModel } from '../../../models/task.model';
import { TaskService } from '../../../service/task.service';
import { MatIcon } from '@angular/material/icon';
import { MatDrawerContainer } from '@angular/material/sidenav';
import { MatTooltip } from '@angular/material/tooltip';
import { NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-list-tasks',
  standalone: true,
  imports: [
    MatIcon,
    MatDrawerContainer,
    MatTooltip,
    NgForOf,
    NgIf
  ],
  templateUrl: './list-tasks.component.html',
  styleUrl: './list-tasks.component.scss'
})
export class ListTasksComponent implements OnInit {
  ngOnInit(): void {
  }
}