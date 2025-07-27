import { Component, OnInit, ViewChild } from '@angular/core';
import { ManageUsersService } from './manage-users.service';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatCard } from '@angular/material/card';
import { NgForOf } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-manage-users',
    standalone: true,
    imports: [
        MatSelect,
        MatOption,
        NgForOf,
        MatFormField,
        MatCard,
        MatPaginator
    ],
    templateUrl: './manage-users.component.html',
    styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {
    users: any[] = [];           // Tous les utilisateurs
    pagedUsers: any[] = [];      // Utilisateurs affichés pour la page active
    roles: string[] = ['ADMIN', 'TRAINER', 'STUDENT'];

    pageSize = 5;
    currentPage = 0;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(private userService: ManageUsersService) {}

    ngOnInit(): void {
        this.userService.getAllUsers().subscribe((res) => {
            this.users = res;
            this.updatePagedUsers();
        });
    }

    updatePagedUsers(): void {
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.pagedUsers = this.users.slice(startIndex, endIndex);
    }

    onPageChange(event: PageEvent): void {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex;
        this.updatePagedUsers();
    }

    onRoleChange(userId: number, newRole: string): void {
        const user = this.users.find(u => u.id === userId);

        this.userService.updateUserRole(userId, newRole).subscribe({
            next: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Role Updated',
                    text: `The role of user ${user?.fullName} has been successfully changed to: ${newRole}.`,
                    confirmButtonColor: '#3085d6'
                });
            },
            error: (err) => {
                console.error('Error updating role:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `Role update failed.`,
                    confirmButtonColor: '#d33'
                });
            }
        });
    }
}
