import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DistribuidoRolComponent } from './distribuido-rol.component';




const routes: Routes = [
    { path: '', component: DistribuidoRolComponent},

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DistribuidorRoutingModule { }
