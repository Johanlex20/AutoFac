import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { DashBoardComponent } from '../dash-board/dash-board.component';
import { CapturaComponent} from '../captura/captura.component';
import { MessagesComponent } from '../messages/messages.component';
import { RegistrosComponent } from '../registros/registros.component';
import { UserComponent } from '../user/user.component';


@NgModule({
  declarations: [
    DashBoardComponent,
    CapturaComponent,
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