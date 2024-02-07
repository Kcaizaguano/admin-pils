import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevolucionesComponent } from './devoluciones.component';
import { DevolucionesRoutingModule } from './devoluciones-routing.module';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { DialogDevolucionComponent } from './dialog-devolucion/dialog-devolucion.component';



@NgModule({
  declarations: [DevolucionesComponent, DialogDevolucionComponent],
  imports: [
    CommonModule,
    DevolucionesRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatIconModule,
  ]
})
export class DevolucionesModule { }
