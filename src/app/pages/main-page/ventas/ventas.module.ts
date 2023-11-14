import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentasRoutingModule } from './ventas-routing.module';
import { VentasComponent } from './ventas.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { NuevaVentaComponent } from './nueva-venta/nueva-venta.component';
import { DialogBuscarClienteComponent } from './dialog-buscar-cliente/dialog-buscar-cliente.component';
import { DialogBuscarRepuestoComponent } from './dialog-buscar-repuesto/dialog-buscar-repuesto.component';
import {MatCardModule} from '@angular/material/card';




@NgModule({
  declarations: [VentasComponent, NuevaVentaComponent, DialogBuscarClienteComponent, DialogBuscarRepuestoComponent],
  imports: [
    CommonModule,
    VentasRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule,
    MatAutocompleteModule,
    MatIconModule,
    MatCardModule
  ]
})
export class VentasModule { }
