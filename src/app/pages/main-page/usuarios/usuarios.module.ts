import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosRoutingModule } from './usuarios-routing.module';
import { UsuariosComponent } from './usuarios.component';

//Angular Material
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from  '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule} from '@angular/material/dialog';

import {MatInputModule} from '@angular/material/input';

//Pipes
import { GeneroPipe } from 'src/app/pipes/genero.pipe';
import { CargoPipe } from 'src/app/pipes/cargo.pipe';
import { EstadoCivilPipe } from 'src/app/pipes/estado-civil.pipe';
import { DialogUsuarioComponent } from './dialog-usuario/dialog-usuario.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';



@NgModule({
  declarations: [UsuariosComponent, GeneroPipe , CargoPipe , EstadoCivilPipe, DialogUsuarioComponent],
  imports: [
    CommonModule,
    UsuariosRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule


  ],
  exports:[
    GeneroPipe,
    CargoPipe,
    EstadoCivilPipe
  ]
})
export class UsuariosModule { }
