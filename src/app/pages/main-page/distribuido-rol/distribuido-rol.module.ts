import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DistribuidoRolComponent } from './distribuido-rol.component';
import { DistribuidorRoutingModule } from './distribuidor-routing.module';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [DistribuidoRolComponent],
  imports: [
    CommonModule,
    DistribuidorRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
  ]
})
export class DistribuidoRolModule { }
