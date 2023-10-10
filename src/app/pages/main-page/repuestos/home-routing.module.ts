import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RepuestosComponent } from './repuestos.component';
import { NuevoRepuestoComponent } from './nuevo-repuesto/nuevo-repuesto.component';
import { EditarRepuestoComponent } from './editar-repuesto/editar-repuesto.component';





const routes: Routes = [
    { path: '',component: RepuestosComponent },
    {path:'nuevo-repuesto',component:NuevoRepuestoComponent},
    {path:'editar-repuesto/:id',component:EditarRepuestoComponent}

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RepuestosRoutingModule { }
