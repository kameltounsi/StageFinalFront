import { Component } from '@angular/core';
import { MatDrawerContainer } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NgStyle } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [
    MatDrawerContainer,
    NgStyle,
    MatIcon,
  ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {
  candidates: any[] = [];
  candidate: any = {} as any;
  pagination = {
    length: 0,
    pageIndex: 0,
    pageSize: 5,
  };

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
      private candidateService: AuthService,
      private router: Router,
      public dialog: MatDialog,
      private authService: AuthService,
  ) {
  }

  ngOnInit(): void {
    // this.loadCandidates();
    this.loadCandidate();
  }
  loadCandidate() {
    // this.candidateService.getCandidateById(Number(this.authService.getUserIdFromToken())).subscribe({
    //   next: (response: any) => {
    //     this.candidate = response;
    //     this.candidate.cv = this.loadCandidateCvUrl(this.candidate.cv);
    //   },
    //   error: (error) => {
    //     console.error('Erreur lors du chargement des candidats:', error);
    //   }
    // });
  }
  // loadCandidates(page: number = 0, size: number = 5): void {
  //     this.candidateService.getCandidatesWithPagination(page, size)
  //         .pipe(takeUntil(this._unsubscribeAll))
  //         .subscribe({
  //             next: (response: any) => {
  //                 this.candidates = response.content.map((candidate: any) => {
  //                     candidate.cv = this.loadCandidateCvUrl(candidate.cv);
  //                     return candidate;
  //                 });
  //                 this.pagination.length = response.totalElements;
  //                 this.pagination.pageIndex = response.number;
  //                 this.pagination.pageSize = response.size;
  //             },
  //             error: (error) => {
  //                 console.error('Erreur lors du chargement des candidats:', error);
  //             }
  //         });
  // }

  // loadCandidateCvUrl(candidateCvUrl: string | undefined):  {
  //   // if (candidateCvUrl) {
  //   //   return `${environment.PRE_DOMAIN_URL}${candidateCvUrl}`;
  //   // }
  //   // return ''; // Retourne une chaîne vide par défaut au lieu de undefined
  // }

  // onPaginatorChange(event: any): void {
  //     this.loadCandidates(event.pageIndex, event.pageSize);
  // }




  //
  // openCvModal(candidate: any): void {
  //   // this.dialog.open(CvModalComponent, {
  //   //   width: '80%',
  //   //   data: { cv: candidate.cv }
  //   // });
  // }
}


