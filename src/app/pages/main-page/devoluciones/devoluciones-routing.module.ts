import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DevolucionesComponent } from './devoluciones.component';




const routes: Routes = [
    {
        path: '',
        component: DevolucionesComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DevolucionesRoutingModule { }
