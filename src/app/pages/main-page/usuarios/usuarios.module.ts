import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosRoutingModule } from './usuarios-routing.module';
import { UsuariosComponent } from './usuarios.component';

//Angular Material
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from  '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule} from '@angular/material/dialog';

//Pipes
import { GeneroPipe } from 'src/app/pipes/genero.pipe';
import { CargoPipe } from 'src/app/pipes/cargo.pipe';
import { EstadoCivilPipe } from 'src/app/pipes/estado-civil.pipe';
import { DialogUsuarioComponent } from './dialog-usuario/dialog-usuario.component';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [UsuariosComponent, GeneroPipe , CargoPipe , EstadoCivilPipe, DialogUsuarioComponent],
  imports: [
    CommonModule,
    UsuariosRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    ReactiveFormsModule
  ],
  exports:[
    GeneroPipe,
    CargoPipe,
    EstadoCivilPipe
  ]
})
export class UsuariosModule { }
