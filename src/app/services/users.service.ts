import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from '../enviroments/enviroments';
import { Observable } from 'rxjs';
import { Iresponse } from '../interface/iresponse';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor( private http:HttpClient) { }

  url:string = `${enviroment.urlServidor}User`

  /*===========================================
  Tomar la data de la coleccion de Usuarios
  ===========================================*/

  getData():Observable<Iresponse>{
    return this.http.get<Iresponse>(this.url);
  }


  getDataFilter(id:string):Observable<Iresponse>{
    return this.http.get<Iresponse>(`${this.url}/${id}`);
  }
}
