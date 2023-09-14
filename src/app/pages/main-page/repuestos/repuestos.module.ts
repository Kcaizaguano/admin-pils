import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepuestosRoutingModule } from './home-routing.module';
import { RepuestosComponent } from './repuestos.component';



@NgModule({
  declarations: [RepuestosComponent],
  imports: [
    CommonModule,
    RepuestosRoutingModule
  ]
})
export class RepuestosModule { }
