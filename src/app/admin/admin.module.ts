import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { DashBoardComponent } from '../dash-board/dash-board.component';
import { HomeComponent } from '../home/home.component';
import { MessagesComponent } from '../messages/messages.component';
import { RegistrosComponent } from '../registros/registros.component';
import { UserComponent } from '../user/user.component';

@NgModule({
  declarations: [
    DashBoardComponent,
    HomeComponent,
    MessagesComponent,
    RegistrosComponent,
    UserComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }