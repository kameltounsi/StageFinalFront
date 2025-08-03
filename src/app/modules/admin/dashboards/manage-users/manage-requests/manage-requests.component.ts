import { Component, Inject, OnInit } from '@angular/core';
import {
    MatDialogRef,
    MAT_DIALOG_DATA,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose, MatDialogTitle
} from '@angular/material/dialog';
import { ManageUsersService } from '../manage-users.service';
import Swal from 'sweetalert2';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {NgForOf, NgIf} from "@angular/common";
import {MatCard} from "@angular/material/card";
import {MatButton} from "@angular/material/button";

@Component({
    selector: 'app-manage-requests',
    templateUrl: './manage-requests.component.html',
    standalone: true,
    imports: [
        MatProgressSpinner,
        NgIf,
        MatCard,
        NgForOf,
        MatButton,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        MatDialogTitle
    ],
    styleUrls: ['./manage-requests.component.css']
})
export class ManageRequestsComponent implements OnInit {
    requests: any[] = [];
    isLoading = true;

    constructor(
        private userService: ManageUsersService,
        public dialogRef: MatDialogRef<ManageRequestsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    ngOnInit(): void {
        this.userService.getPendingRequests().subscribe({
            next: (res) => {
                this.requests = res;
                this.isLoading = false;
            },
            error: () => {
                Swal.fire('Error', 'Failed to load requests', 'error');
                this.isLoading = false;
            }
        });
    }

    approveRequest(requestId: number): void {
        this.userService.updateRequestStatus(requestId, 'APPROVED').subscribe({
            next: () => {
                Swal.fire('Success', 'Request approved successfully!', 'success');
                this.requests = this.requests.filter(r => r.id !== requestId);
            },
            error: () => Swal.fire('Error', 'Failed to approve request', 'error')
        });
    }

    rejectRequest(requestId: number): void {
        this.userService.updateRequestStatus(requestId, 'REJECTED').subscribe({
            next: () => {
                Swal.fire('Success', 'Request rejected successfully!', 'success');
                this.requests = this.requests.filter(r => r.id !== requestId);
            },
            error: () => Swal.fire('Error', 'Failed to reject request', 'error')
        });
    }

    closeDialog(): void {
        this.dialogRef.close('closed');
    }
}
