import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComprasComponent } from './compras.component';
import { NuevaCompraComponent } from './nueva-compra/nueva-compra.component';
import { VerCompraComponent } from './ver-Compra/verCompra.component';







const routes: Routes = [
    { path: '', component: ComprasComponent},
    { path: 'nueva-compra/:id',component: NuevaCompraComponent},
    { path: 'ver-compra/:id',component: VerCompraComponent },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CompraRoutingModule { }
