import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditoriaRepuestosComponent } from './auditoria-repuestos.component';
import { AuditoriaRepuestosRoutingModule } from './auditoria-repuestos-routing.module';



@NgModule({
  declarations: [ AuditoriaRepuestosComponent],
  imports: [
    CommonModule,
    AuditoriaRepuestosRoutingModule
  ]
})
export class AuditoriaRepuestosModule { }
