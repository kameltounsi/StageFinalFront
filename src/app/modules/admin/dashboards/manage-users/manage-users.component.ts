import { Component, OnInit, ViewChild } from '@angular/core';
import { ManageUsersService } from './manage-users.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { AddUserComponent } from './add-user/add-user.component';
import {MatButton} from "@angular/material/button";
import {MatCard} from "@angular/material/card";
import {MatFormField} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {NgForOf} from "@angular/common";

@Component({
    selector: 'app-manage-users',
    templateUrl: './manage-users.component.html',
    styleUrls: ['./manage-users.component.css'],
    imports: [
        MatButton,
        MatCard,
        MatFormField,
        MatSelect,
        MatOption,
        MatPaginator,
        NgForOf
    ],
    standalone: true
})
export class ManageUsersComponent implements OnInit {
    users: any[] = [];
    pagedUsers: any[] = [];
    roles: string[] = ['ADMIN', 'TRAINER', 'STUDENT'];
    currentUserEmail: string = '';
    pageSize = 5;
    currentPage = 0;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(
        private userService: ManageUsersService,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            this.currentUserEmail = user.email;
        }
        this.loadUsers();
    }

    loadUsers(): void {
        this.userService.getAllUsers().subscribe((res) => {
            this.users = res.filter((u) => u.email !== this.currentUserEmail);
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
        const user = this.users.find((u) => u.id === userId);

        this.userService.updateUserRole(userId, newRole).subscribe({
            next: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Role Updated',
                    text: `The role of user ${user?.fullName} has been successfully changed to: ${newRole}.`,
                    confirmButtonColor: '#3085d6',
                });
            },
            error: (err) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Role update failed.',
                    confirmButtonColor: '#d33',
                });
            },
        });
    }

    openAddUserDialog(): void {
        const dialogRef = this.dialog.open(AddUserComponent, {
            width: '500px',
            disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'success') {
                this.loadUsers();
                Swal.fire({
                    icon: 'success',
                    title: 'User Added',
                    text: 'The new user was successfully added.',
                    confirmButtonColor: '#3085d6',
                });
            }
        });
    }
}
