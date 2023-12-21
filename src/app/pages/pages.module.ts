import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainPageComponent } from './main-page/main-page.component';
import { SharedModule } from '../shared/shared.module';
import { AppRoutingModule } from '../app-routing.module';
import { Error404Component } from './main-page/error404/error404.component';
import { DistribuidoRolComponent } from './main-page/distribuido-rol/distribuido-rol.component';





@NgModule({
  declarations: [
    MainPageComponent,
    Error404Component,
    

  ],
  imports: [
    CommonModule,
    SharedModule,
    AppRoutingModule
  ]
})
export class PagesModule { }
