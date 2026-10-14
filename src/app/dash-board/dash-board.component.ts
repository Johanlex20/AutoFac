import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { DashBoardService } from './dash-board.service';
import { Data } from '../interface/data.interfaces';
import { AuthService } from '../auth/auth.service';
import { InactivityService } from '../auth/inactivity.service';
import { Observable } from 'rxjs';
import { Perfil, PerfilService } from '../perfil/perfil.service';

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

  perfil$: Observable<Perfil | null>;

  constructor(
    private dataService: DashBoardService,
    private authService: AuthService,
    private inactivityService: InactivityService,
    private perfilService: PerfilService,
    private router: Router
  ){
    this.perfil$ = this.perfilService.perfil$;
  }

  ngOnInit():void {
    this.isSidebarActive = localStorage.getItem('sidebar') === 'true';
     this.inactivityService.iniciar();

    // Se limpia primero para no mostrar un instante la foto de la sesion anterior
    this.perfilService.limpiar();
    this.perfilService.cargar().subscribe({ error: () => {} });
  }

  urlFoto(fotoUrl: string | null | undefined): string | null {
    return this.perfilService.urlFoto(fotoUrl);
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
    this.perfilService.limpiar();
    this.router.navigate(['/admin/login']);
  }
}
