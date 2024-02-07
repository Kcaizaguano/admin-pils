import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment, httpOption } from '../enviroments/enviroments';
import { Observable } from 'rxjs';
import { Iresponse } from '../interface/iresponse';
import { Idevolucion } from '../interface/idevolucion';

@Injectable({
  providedIn: 'root'
})
export class DevolucionesService {


  constructor(private http:HttpClient) { }

  url:string = `${enviroment.urlServidor}Devoluciones`

  /*===========================================
  Obtener listado de datos completos
  ===========================================*/
  getData():Observable<Iresponse>{
    return this.http.get<Iresponse>(this.url);
  }


  /*=====================
Guaradar información 
  =======================*/

  postData(data : Idevolucion):Observable<Iresponse>{

    return this.http.post<Iresponse>(this.url,data, httpOption);
  }


/*========================
  Actualizar información 
  ========================*/

  putData(data : Idevolucion):Observable<Iresponse>{

    return this.http.put<Iresponse>(this.url,data, httpOption);
  }


  /*===================
  Elminiar información 
  =====================*/

  deleteData(id: number):Observable<Iresponse>{

    return this.http.delete<Iresponse>(`${this.url}/${id}`);
  }

    /*===================
  Elminiar información 
  =====================*/

  getItem(id: number):Observable<Iresponse>{

    return this.http.get<Iresponse>(`${this.url}/${id}`);
  }

}
