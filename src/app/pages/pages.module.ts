import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainPageComponent } from './main-page/main-page.component';
import { SharedModule } from '../shared/shared.module';
import { AppRoutingModule } from '../app-routing.module';
import { Error404Component } from './main-page/error404/error404.component';
import { ComprasComponent } from './main-page/compras/compras.component';
import { NuevaCompraComponent } from './main-page/compras/nueva-compra/nueva-compra.component';
import { AuditoriaRepuestosComponent } from './main-page/auditoria-repuestos/auditoria-repuestos.component';



@NgModule({
  declarations: [
    MainPageComponent,
    Error404Component
    

  ],
  imports: [
    CommonModule,
    SharedModule,
    AppRoutingModule
  ]
})
export class PagesModule { }
