import { Component, OnInit, ViewChild } from '@angular/core';
import { ManageUsersService } from './manage-users.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { AddUserComponent } from './add-user/add-user.component';
import { MatButton } from "@angular/material/button";
import { MatCard } from "@angular/material/card";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatOption, MatSelect } from "@angular/material/select";
import {NgForOf, NgIf} from "@angular/common";
import { FormsModule } from '@angular/forms';
import { MatInput } from "@angular/material/input";
import { ManageRequestsComponent } from './manage-requests/manage-requests.component';

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
        NgForOf,
        FormsModule,
        MatLabel,
        MatInput,
        NgIf
    ],
    standalone: true
})
export class ManageUsersComponent implements OnInit {
    users: any[] = [];
    filteredUsers: any[] = [];
    pagedUsers: any[] = [];
    roles: string[] = ['ADMIN', 'TRAINER', 'STUDENT'];
    pendingRequestsCount: number = 0;

    searchQuery: string = '';
    selectedRole: string = 'ALL';   // ✅ correction ici
    sortDirection: 'asc' | 'desc' = 'asc'; // ✅ correction ici

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
            this.applyFilters();
        });

        // Charger le nombre de requêtes PENDING
        this.userService.getPendingRequests().subscribe(res => {
            this.pendingRequestsCount = res.length;
        });
    }
    openManageRequestsDialog(): void {
        const dialogRef = this.dialog.open(ManageRequestsComponent, {
            width: '600px',
            disableClose: true,
        });

        dialogRef.afterClosed().subscribe(() => {
            this.loadUsers(); // refresh compteur
        });
    }
    // 🔎 Appliquer recherche + filtre + tri
    applyFilters(): void {
        this.filteredUsers = this.users
            .filter(user =>
                (!this.searchQuery ||
                    user.fullName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    user.email.toLowerCase().includes(this.searchQuery.toLowerCase()))
                && (this.selectedRole === 'ALL' || user.role === this.selectedRole)
            )
            .sort((a, b) =>
                this.sortDirection === 'asc'
                    ? a.fullName.localeCompare(b.fullName)
                    : b.fullName.localeCompare(a.fullName)
            );

        this.currentPage = 0;
        this.updatePagedUsers();
    }

    // 📄 Pagination
    updatePagedUsers(): void {
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.pagedUsers = this.filteredUsers.slice(startIndex, endIndex);
    }

    onPageChange(event: PageEvent): void {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex;
        this.updatePagedUsers();
    }

    // 🔄 Tri A-Z / Z-A
    toggleSort(): void {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        this.applyFilters();
    }

    // 🔄 Mise à jour rôle
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
                if (user) user.role = newRole;
                this.applyFilters();
            },
            error: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Role update failed.',
                    confirmButtonColor: '#d33',
                });
            },
        });
    }

    // ➕ Ajouter un utilisateur
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

    protected readonly Math = Math;
}
