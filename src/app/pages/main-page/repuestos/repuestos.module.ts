import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepuestosRoutingModule } from './home-routing.module';
import { RepuestosComponent } from './repuestos.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NuevoRepuestoComponent } from './nuevo-repuesto/nuevo-repuesto.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { EditarRepuestoComponent } from './editar-repuesto/editar-repuesto.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { DialogMarcasRepuestosComponent } from './dialog-marcas/dialog-marcas.component';
import { DialogModelosRepuestosComponent } from './dialog-modelos/dialog-modelos.component';
import { DialogAlmacenRepuestoComponent } from './dialog-almacen-repuesto/dialog-almacen-repuesto.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DialogActualizarStockComponent } from './dialog-actualizar-stock/dialog-actualizar-stock.component';




@NgModule({
  declarations: [
    RepuestosComponent, 
    NuevoRepuestoComponent, 
    EditarRepuestoComponent, 
    DialogMarcasRepuestosComponent, 
    DialogModelosRepuestosComponent, DialogAlmacenRepuestoComponent, DialogActualizarStockComponent
                ],
  imports: [
    CommonModule,
    RepuestosRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    FormsModule,
    MatAutocompleteModule,
    MatSlideToggleModule
  ]
})
export class RepuestosModule { }
