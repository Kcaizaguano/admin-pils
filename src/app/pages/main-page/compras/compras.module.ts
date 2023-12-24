import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComprasComponent } from './compras.component';
import { CompraRoutingModule } from './compras-routing.module';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { NuevaCompraComponent } from './nueva-compra/nueva-compra.component';
import { VerCompraComponent } from './ver-Compra/verCompra.component';



@NgModule({
  declarations: [ ComprasComponent, NuevaCompraComponent, VerCompraComponent],
  imports: [
    CommonModule,
    CompraRoutingModule,
    MatTableModule,
    MatPaginatorModule,
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
export class ComprasModule { }
