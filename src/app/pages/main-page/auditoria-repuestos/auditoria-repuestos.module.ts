import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditoriaRepuestosComponent } from './auditoria-repuestos.component';
import { AuditoriaRepuestosRoutingModule } from './auditoria-repuestos-routing.module';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';



@NgModule({
  declarations: [ AuditoriaRepuestosComponent],
  imports: [
    CommonModule,
    AuditoriaRepuestosRoutingModule,
    MatTableModule,
    MatPaginatorModule
  ]
})
export class AuditoriaRepuestosModule { }
