import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashBoardComponent } from './dash-board/dash-board.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import { MessagesComponent } from './messages/messages.component';
import { RegistrosComponent } from './registros/registros.component';
import { UserComponent } from './user/user.component';

@NgModule({ declarations: [
        AppComponent,
        DashBoardComponent,
        HomeComponent,
        MessagesComponent,
        RegistrosComponent,
        UserComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
