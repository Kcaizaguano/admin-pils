import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RolEmpleadoComponent } from './rol-empleado.component';





const routes: Routes = [
    {
        path: '',
        component: RolEmpleadoComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmpleadoRolRoutingModule { }
