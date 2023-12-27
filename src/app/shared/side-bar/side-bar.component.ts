import { Component, OnInit } from '@angular/core';
import { timeInterval } from 'rxjs';
import { alerts } from 'src/app/helpers/alerts';
import { AlmacenesService } from 'src/app/services/almacenes.service';
import { ApiauthService } from 'src/app/services/apiauth.service';
import { EmpleadosService } from 'src/app/services/empleados.service';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ImagenesService } from 'src/app/services/imagenes.service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {

  constructor(private apiauthService: ApiauthService,
    private empleadosService: EmpleadosService,
    private sanitizer: DomSanitizer,
    private almacenesService: AlmacenesService) {
  }


  /**********************************
  Variables del usuario conectado
  *********************************/
  nombre = '';
  apellido = '';
  cargo = '';
  alamcen = '';
  imagenUrl = "";
  administrador = false;
  empleado = false;
  distribuidor = false;

  //localStorage.getItem('usuario')

  ngOnInit(): void {

    const usuario = JSON.parse(localStorage.getItem('usuario')!);
    this.cargarUsuario(usuario.id);
    this.cargo = this.cargarCargo(usuario.cargo);
    this.cargarAlmacen(usuario.almacen);

    switch (usuario.cargo) {
      case "1":
        this.administrador = true;
        break;
      case "2":
        this.empleado = true;
        break;
      case "3":
        this.distribuidor = true;
        break;

      default:
        break;
    }


  }

  cargarUsuario(id: number) {
    this.empleadosService.getItem(id.toString()).subscribe(
      resp => {
        this.nombre = resp.data.empNombres;
        this.apellido = resp.data.emplApellidos;
        this.imagenUrl = resp.data.empUrlImagen;


      }
    )
  }

  cargarAlmacen(id: number) {
    this.almacenesService.getItem(id.toString()).subscribe(
      res => {
        this.alamcen = res.data.almNombre;
      }
    )
  }

  cargarCargo(value: string) {
    switch (value) {
      case "1":
        return 'Administrador';
      case "2":
        return 'Vendedor';
      case "3":
        return 'Distribuidor';
      default:
        return 'Desconocido';
    }

  }

  logout() {
    alerts.confirmAlert("¿ Estás seguro que desea salir ?", "", "warning", "Si, salir").then(
      (result) => {
        if (result.isConfirmed) {
          this.apiauthService.logout();
        }
      }
    )

  }


  /*===========================================
  Función para la seguridad de la URL
  ===========================================*/

  sanitizeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }


}
