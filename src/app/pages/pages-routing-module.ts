import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { Error404Component } from './main-page/error404/error404.component';
import { AuthGuard } from '../security/auth.guard';


const routes: Routes = [
  {path:'login',loadChildren:() => import('./login/login.module').then(m => m.LoginModule)},
  { path:'',
    component:MainPageComponent,
    children:[
      {path:'', loadChildren:() => import('./main-page/home/home.module').then(m => m.HomeModule), canActivate:[AuthGuard] },
      {path:'usuarios', loadChildren:() => import('./main-page/usuarios/usuarios.module').then(m => m.UsuariosModule),  canActivate:[AuthGuard]},
      {path:'repuestos', loadChildren:() => import('./main-page/repuestos/repuestos.module').then(m => m.RepuestosModule),  canActivate:[AuthGuard]},
      {path:'ventas', loadChildren:() => import('./main-page/ventas/ventas.module').then(m => m.VentasModule),  canActivate:[AuthGuard]},
      {path:'clientes', loadChildren:() => import('./main-page/clientes/clientes.module').then(m => m.ClientesModule),  canActivate:[AuthGuard]},
      {path:'proveedores', loadChildren:() => import('./main-page/proveedores/proveedores.module').then(m => m.ProveedoresModule),  canActivate:[AuthGuard]},
      {path:'modelos', loadChildren:() => import('./main-page/modelos/modelos.module').then(m => m.ModelosModule),  canActivate:[AuthGuard]},
      {path:'marcas', loadChildren:() => import('./main-page/marcas/marcas.module').then(m => m.MarcasModule),  canActivate:[AuthGuard]},
      {path:'almacenes', loadChildren:() => import('./main-page/almacenes/almacenes.module').then(m => m.AlmacenesModule),  canActivate:[AuthGuard]},
      {path:'ciudades', loadChildren:() => import('./main-page/ciudades/ciudades.module').then(m => m.CiudadesModule),  canActivate:[AuthGuard]},
      {path:'perfil', loadChildren:() => import('./main-page/perfil/perfil.module').then(m => m.PerfilModule),  canActivate:[AuthGuard]},
      {path:'**',component:Error404Component}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
