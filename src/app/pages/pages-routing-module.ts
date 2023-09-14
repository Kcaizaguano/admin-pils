import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { Error404Component } from './main-page/error404/error404.component';


const routes: Routes = [
  {path:'login',loadChildren:() => import('./login/login.module').then(m => m.LoginModule)},
  { path:'',
    component:MainPageComponent,
    children:[
      {path:'', loadChildren:() => import('./main-page/home/home.module').then(m => m.HomeModule) },
      {path:'usuarios', loadChildren:() => import('./main-page/usuarios/usuarios.module').then(m => m.UsuariosModule)},
      {path:'repuestos', loadChildren:() => import('./main-page/repuestos/repuestos.module').then(m => m.RepuestosModule)},
      {path:'ventas', loadChildren:() => import('./main-page/ventas/ventas.module').then(m => m.VentasModule)},
      {path:'clientes', loadChildren:() => import('./main-page/clientes/clientes.module').then(m => m.ClientesModule)},
      {path:'proveedores', loadChildren:() => import('./main-page/proveedores/proveedores.module').then(m => m.ProveedoresModule)},
      {path:'modelos', loadChildren:() => import('./main-page/modelos/modelos.module').then(m => m.ModelosModule)},
      {path:'marcas', loadChildren:() => import('./main-page/marcas/marcas.module').then(m => m.MarcasModule)},
      {path:'almacenes', loadChildren:() => import('./main-page/almacenes/almacenes.module').then(m => m.AlmacenesModule)},
      {path:'ciudades', loadChildren:() => import('./main-page/ciudades/ciudades.module').then(m => m.CiudadesModule)},
      {path:'perfil', loadChildren:() => import('./main-page/perfil/perfil.module').then(m => m.PerfilModule)},
      {path:'**',component:Error404Component}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
