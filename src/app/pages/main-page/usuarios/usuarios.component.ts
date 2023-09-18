import { Component, OnInit} from '@angular/core';
import { Iusuario } from 'src/app/interface/iusuario';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements  OnInit {


  constructor( private usersService: UsersService){}
  /*===========================================
  Variable global de la interfaz de usuario
  ===========================================*/
  usuarios:Iusuario[]=[];


  ngOnInit(): void {

    this.getData();
  }

  /*===========================================
  Función para tomar la data de los usuarios
  ===========================================*/

  getData(){

    this.usersService.getData().subscribe(
      resp=>{
        console.log("resp: ", resp);

      }
    )

  }
  

}
