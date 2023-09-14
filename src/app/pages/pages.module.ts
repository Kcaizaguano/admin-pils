import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainPageComponent } from './main-page/main-page.component';
import { SharedModule } from '../shared/shared.module';
import { AppRoutingModule } from '../app-routing.module';
import { UsuariosComponent } from './main-page/usuarios/usuarios.component';
import { RepuestosComponent } from './main-page/repuestos/repuestos.component';
import { VentasComponent } from './main-page/ventas/ventas.component';
import { ClientesComponent } from './main-page/clientes/clientes.component';
import { PerfilComponent } from './main-page/perfil/perfil.component';
import { ProveedoresComponent } from './main-page/proveedores/proveedores.component';
import { ModelosComponent } from './main-page/modelos/modelos.component';
import { MarcasComponent } from './main-page/marcas/marcas.component';
import { AlmacenesComponent } from './main-page/almacenes/almacenes.component';
import { CiudadesComponent } from './main-page/ciudades/ciudades.component';
import { Error404Component } from './main-page/error404/error404.component';



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
