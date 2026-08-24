import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { DocumentosComponent } from './documentos/documentos.component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'documentos', component: DocumentosComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
