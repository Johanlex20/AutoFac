import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashBoardComponent } from '../dash-board/dash-board.component';
import { CapturaComponent} from '../captura/captura.component';
import { HomeComponent } from './home/home.component';
import { MessagesComponent } from '../messages/messages.component';
import { RegistrosComponent } from '../registros/registros.component';
import { UserComponent } from '../user/user.component';
import { DocumentosComponent } from '../admin/documentos/documentos.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from '../auth/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: DashBoardComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'captura', component: CapturaComponent },
      { path: 'registros/list', component: RegistrosComponent },
      { path: 'messages/list', component: MessagesComponent },
      { path: 'usuarios/list', component: UserComponent },
      { path: 'documentos/list', component: DocumentosComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }