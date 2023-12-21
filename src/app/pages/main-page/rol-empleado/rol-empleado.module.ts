import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolEmpleadoComponent } from './rol-empleado.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { EmpleadoRolRoutingModule } from './empleado-rol-routing.module';



@NgModule({
  declarations: [ RolEmpleadoComponent],
  imports: [
    CommonModule,
    EmpleadoRolRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
  ]
})
export class RolEmpleadoModule { }
