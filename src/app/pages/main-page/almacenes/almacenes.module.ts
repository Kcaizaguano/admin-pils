import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlmacenesRoutingModule } from './almacenes-routing.module';
import { AlmacenesComponent } from './almacenes.component';
import { DialogAlmacenComponent } from './dialog-almacen/dialog-almacen.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';



@NgModule({
  declarations: [AlmacenesComponent, DialogAlmacenComponent],
  imports: [
    CommonModule,
    AlmacenesRoutingModule,
    MatPaginatorModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatSlideToggleModule

  ]
})
export class AlmacenesModule { }
