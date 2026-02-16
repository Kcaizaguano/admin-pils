import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CotizacionComponent } from './cotizacion.component';
import { NuevaVentaComponent } from '../ventas/nueva-venta/nueva-venta.component';
import { NuevaCotizacionComponent } from './nueva-cotizacion/nueva-cotizacion/nueva-cotizacion.component';






const routes: Routes = [
    { path: '', component: CotizacionComponent},
    { path: 'nueva-venta',component: NuevaVentaComponent},
    { path: 'cotizar',component: NuevaCotizacionComponent}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CotizacionRoutingModule { }
