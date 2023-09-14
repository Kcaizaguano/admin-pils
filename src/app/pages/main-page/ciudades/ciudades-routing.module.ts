import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CiudadesComponent } from './ciudades.component';





const routes: Routes = [
    {
        path: '',
        component: CiudadesComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CiudadesRoutingModule { }
