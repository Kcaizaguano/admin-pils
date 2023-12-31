import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VentasComponent } from './ventas.component';
import { NuevaVentaComponent } from './nueva-venta/nueva-venta.component';
import { VerVentaComponent } from './ver-venta/ver-venta.component';
import { EditarVentaComponent } from './editar-venta/editar-venta.component';
import { EditarFacturaComponent } from './editar-factura/editar-factura.component';







const routes: Routes = [
    { path: '',component: VentasComponent },
    { path: 'nueva-venta/:tipo',component: NuevaVentaComponent },
    { path: 'editar-venta/:tipo/:id',component: EditarVentaComponent },
    { path: 'editar-factura/:id',component: EditarFacturaComponent },
    { path: 'ver-venta/:tipo/:id',component: VerVentaComponent },




];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class VentasRoutingModule { }
