import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelosRoutingModule } from './modelos-routing.module';
import { ModelosComponent } from './modelos.component';



@NgModule({
  declarations: [ModelosComponent],
  imports: [
    CommonModule,
    ModelosRoutingModule
  ]
})
export class ModelosModule { }
