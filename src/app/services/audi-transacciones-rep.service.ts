import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment, httpOption } from '../enviroments/enviroments';
import { Observable } from 'rxjs';
import { Iresponse } from '../interface/iresponse';
import { IAuditoriaRepuestoTransaccion } from '../interface/i-auditoria-repuesto-transaccion';

@Injectable({
  providedIn: 'root'
})
export class AudiTransaccionesRepService {
  constructor(private http:HttpClient) { }
  

  url:string = `${enviroment.urlServidor}AuditoriaRepuestosTransacciones`

  /*===========================================
  Obtener listado de datos completos
  ===========================================*/
  getData():Observable<Iresponse>{
    return this.http.get<Iresponse>(this.url);
  }


  /*=====================
Guaradar información 
  =======================*/

  postData(data : IAuditoriaRepuestoTransaccion):Observable<Iresponse>{

    return this.http.post<Iresponse>(this.url,data, httpOption);
  }
}
