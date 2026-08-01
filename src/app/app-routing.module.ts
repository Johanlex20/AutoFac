import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashBoardComponent } from './dash-board/dash-board.component';
import { HomeComponent } from './home/home.component';
import { MessagesComponent } from './messages/messages.component';
import { RegistrosComponent } from './registros/registros.component';
import { UserComponent } from './user/user.component';

const routes: Routes = [
   {
    path: '',
    redirectTo: 'dashboard/home',
    pathMatch: 'full'
  },
  {
    path:'dashboard',
    component: DashBoardComponent,
    children:[
      {path: 'home', component: HomeComponent},
      {path: 'registros/list', component: RegistrosComponent},
      {path: 'messages/list', component: MessagesComponent},
      {path: 'usuarios/list', component: UserComponent},
      {path: '', redirectTo: 'home', pathMatch: 'full'}//RUTA POR DEFECTO
    ]
  },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
