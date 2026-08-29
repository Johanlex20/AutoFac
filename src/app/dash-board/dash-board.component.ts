import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { DashBoardService } from './dash-board.service';
import { Data } from '../interface/data.interfaces';
import { AuthService } from '../auth/auth.service';
import { InactivityService } from '../auth/inactivity.service';

@Component({
    selector: 'app-dash-board',
    templateUrl: './dash-board.component.html',
    styleUrls: [],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DashBoardComponent implements OnInit, OnDestroy {
  isSidebarActive = false;
  selectedIndex = 0;

  constructor(
    private dataService: DashBoardService,
    private authService: AuthService,
    private inactivityService: InactivityService,
    private router: Router
  ){}

  ngOnInit():void {
    this.isSidebarActive = localStorage.getItem('sidebar') === 'true';
     this.inactivityService.iniciar();
  }

  ngOnDestroy(): void {
    this.inactivityService.detener();
  }

  estaAutenticado(): boolean {
    return this.authService.isAuthenticated();
  }


  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
      localStorage.setItem('sidebar', this.isSidebarActive.toString());
  }

  selectItem(index: number) {
    this.selectedIndex = index;
  }

  cerrarSesion(): void {
    this.inactivityService.detener();
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
