import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment, httpOption } from '../enviroments/enviroments';
import { Observable } from 'rxjs';
import { Iresponse } from '../interface/iresponse';
import { Ialmacen } from '../interface/ialmacen';

@Injectable({
  providedIn: 'root'
})
export class AlmacenesService {

  constructor(private http:HttpClient) { }

  url:string = `${enviroment.urlServidor}Almacenes`


  getData():Observable<Iresponse>{
    return this.http.get<Iresponse>(this.url);
  }

  /*=====================
Guardar información 
  =======================*/

  postData(data : Ialmacen):Observable<Iresponse>{

    return this.http.post<Iresponse>(this.url,data, httpOption);
  }


/*========================
  Actualizar información 
  ========================*/

  putData(data : Ialmacen):Observable<Iresponse>{

    return this.http.put<Iresponse>(this.url,data, httpOption);
  }


  /*===================
  Elminiar información 
  =====================*/

  deleteData(id: number):Observable<Iresponse>{

    return this.http.delete<Iresponse>(`${this.url}/${id}`);
  }
}
