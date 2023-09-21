import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Iresponse } from '../interface/iresponse';
import { enviroment, httpOption } from '../enviroments/enviroments';
import { Iempleados } from '../interface/iempleados';

@Injectable({
  providedIn: 'root'
})
export class EmpleadosService {

  constructor(private http:HttpClient) { }

  url:string = `${enviroment.urlServidor}Empleados`

  /*===========================================
  Obtener listado de datos completos
  ===========================================*/
  getData():Observable<Iresponse>{
    return this.http.get<Iresponse>(this.url);
  }


  /*=====================
Guaradar información 
  =======================*/

  postData(data : Iempleados):Observable<Iresponse>{

    return this.http.post<Iresponse>(this.url,data, httpOption);
  }


/*========================
  Actualizar información 
  ========================*/

  putData(data : Iempleados):Observable<Iresponse>{

    return this.http.put<Iresponse>(this.url,data, httpOption);
  }


  /*===================
  Elminiar información 
  =====================*/

  deleteData(id: number):Observable<Iresponse>{

    return this.http.delete<Iresponse>(`${this.url}/${id}`);
  }


}
