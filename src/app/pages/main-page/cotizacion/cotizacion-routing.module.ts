import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CotizacionComponent } from './cotizacion.component';
import { NuevaVentaComponent } from '../ventas/nueva-venta/nueva-venta.component';






const routes: Routes = [
    { path: '', component: CotizacionComponent},
    { path: 'nueva-venta',component: NuevaVentaComponent}

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CotizacionRoutingModule { }
