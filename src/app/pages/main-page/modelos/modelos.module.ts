import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelosRoutingModule } from './modelos-routing.module';
import { ModelosComponent } from './modelos.component';
import { DialogModeloComponent } from './dialog-modelo/dialog-modelo.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [ModelosComponent, DialogModeloComponent],
  imports: [
    CommonModule,
    ModelosRoutingModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule
  ]
})
export class ModelosModule { }
