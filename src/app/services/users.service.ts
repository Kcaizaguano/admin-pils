import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from '../enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor( private http:HttpClient) { }

  url:string = `${enviroment.urlServidor}User`

  /*===========================================
  Tomar la data de la coleccion de Usuarios
  ===========================================*/

  getData(){
    return this.http.get(this.url);
  }
}
