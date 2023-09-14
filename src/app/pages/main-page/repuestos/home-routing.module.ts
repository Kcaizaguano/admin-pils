import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RepuestosComponent } from './repuestos.component';





const routes: Routes = [
    {
        path: '',
        component: RepuestosComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RepuestosRoutingModule { }
