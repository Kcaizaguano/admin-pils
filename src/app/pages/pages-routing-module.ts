import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { Error404Component } from './main-page/error404/error404.component';
import { AuthGuard } from '../security/auth.guard';
import { VerVentaComponent } from './main-page/ventas/ver-venta/ver-venta.component';
import { cargoGuard } from '../security/cargo.guard';



const routes: Routes = [
  {path:'login',loadChildren:() => import('./login/login.module').then(m => m.LoginModule)},
  { path:'',
    component:MainPageComponent,canActivate:[AuthGuard],
    children:[
      {path:'', loadChildren:() => import('./main-page/inicio/inicio.module').then(m => m.InicioModule) },
      {path:'dashboard', loadChildren:() => import('./main-page/home/home.module').then(m => m.HomeModule),  canActivate: [cargoGuard(['1'])] },
      {path:'usuarios', loadChildren:() => import('./main-page/usuarios/usuarios.module').then(m => m.UsuariosModule), canActivate: [cargoGuard(['1', '2'])]},
      {path:'repuestos', loadChildren:() => import('./main-page/repuestos/repuestos.module').then(m => m.RepuestosModule), canActivate: [cargoGuard(['1', '2'])]},
      {path:'ventas', loadChildren:() => import('./main-page/ventas/ventas.module').then(m => m.VentasModule), canActivate: [cargoGuard(['1', '2'])]},
      {path:'clientes', loadChildren:() => import('./main-page/clientes/clientes.module').then(m => m.ClientesModule), canActivate: [cargoGuard(['1', '2'])]},
      {path:'proveedores', loadChildren:() => import('./main-page/proveedores/proveedores.module').then(m => m.ProveedoresModule), canActivate: [cargoGuard(['1', '2'])]},
      {path:'modelos', loadChildren:() => import('./main-page/modelos/modelos.module').then(m => m.ModelosModule), canActivate: [cargoGuard(['1', '2'])]},
      {path:'marcas', loadChildren:() => import('./main-page/marcas/marcas.module').then(m => m.MarcasModule), canActivate: [cargoGuard(['1', '2'])]},
      {path:'almacenes', loadChildren:() => import('./main-page/almacenes/almacenes.module').then(m => m.AlmacenesModule), canActivate: [cargoGuard(['1', '2'])]},
      {path:'ciudades', loadChildren:() => import('./main-page/ciudades/ciudades.module').then(m => m.CiudadesModule), canActivate: [cargoGuard(['1', '2'])]},
      {path:'perfil', loadChildren:() => import('./main-page/perfil/perfil.module').then(m => m.PerfilModule)},
      {path:'cotizacion', loadChildren:() => import('./main-page/cotizacion/cotizacion.module').then(m => m.CotizacionModule), canActivate: [cargoGuard(['1', '2'])]},
      {path:'compras', loadChildren:() => import('./main-page/compras/compras.module').then(m => m.ComprasModule), canActivate: [cargoGuard(['1', '2'])]},
      {path:'transacciones', loadChildren:() => import('./main-page/auditoria-repuestos/auditoria-repuestos.module').then(m => m.AuditoriaRepuestosModule), canActivate: [cargoGuard(['1'])]},
      {path:'rolEmpleado', loadChildren:() => import('./main-page/rol-empleado/rol-empleado.module').then(m => m.RolEmpleadoModule), canActivate: [cargoGuard(['2'])]},
      {path:'rolDistribuidor', loadChildren:() => import('./main-page/distribuido-rol/distribuido-rol.module').then(m => m.DistribuidoRolModule), canActivate: [cargoGuard(['3'])]},
      {path:'reportes', loadChildren:() => import('./main-page/reportes/reportes.module').then(m => m.ReportesModule), canActivate: [cargoGuard(['1'])]},


      {path:'**',component:Error404Component}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
