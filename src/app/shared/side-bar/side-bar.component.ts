import { Component, OnInit } from '@angular/core';
import { timeInterval } from 'rxjs';
import { alerts } from 'src/app/helpers/alerts';
import { ApiauthService } from 'src/app/services/apiauth.service';
import { EmpleadosService } from 'src/app/services/empleados.service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {

  constructor(private apiauthService: ApiauthService,
    private empleadosService: EmpleadosService) {
  }


  /**********************************
  Variables del usuario conectado
  *********************************/
nombre='';
cargo='';

 //localStorage.getItem('usuario')

  ngOnInit(): void {

    const usuario = JSON.parse(localStorage.getItem('usuario')! );
    this.cargarUsuario(usuario.id);
    this.cargo = this.cargarCargo(usuario.cargo);


  }

  cargarUsuario(id : number){
    this.empleadosService.getItem(id.toString()).subscribe(
      resp => {
        this.nombre = resp.data.empNombres +' '+resp.data.emplApellidos
      }
    )
  }

  cargarCargo(value : string){
    switch (value) {
      case "1":
        return 'Administrador';
      case "2":
        return 'Vendedor';
        case "3":
          return 'Bodeguero';
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

}
