import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CiudadesRoutingModule } from './ciudades-routing.module';
import { CiudadesComponent } from './ciudades.component';



@NgModule({
  declarations: [CiudadesComponent],
  imports: [
    CommonModule,
    CiudadesRoutingModule
  ]
})
export class CiudadesModule { }
