import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuditoriaRepuestosComponent } from './auditoria-repuestos.component';

const routes: Routes = [
    { path: '', component: AuditoriaRepuestosComponent},

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuditoriaRepuestosRoutingModule { }
