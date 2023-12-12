import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//Componentes
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { FooterComponent } from './footer/footer.component';
import { SideBarComponent } from './side-bar/side-bar.component';

//Rutas
import { RouterModule } from '@angular/router';
import { CargoPipe } from '../pipes/cargo.pipe';


@NgModule({
  declarations: [
    NavBarComponent,
    FooterComponent,
    SideBarComponent,
  ],
  exports:[
    NavBarComponent,
    FooterComponent,
    SideBarComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class SharedModule { }
