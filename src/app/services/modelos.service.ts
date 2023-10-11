import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment, httpOption } from '../enviroments/enviroments';
import { Iresponse } from '../interface/iresponse';
import { Observable } from 'rxjs';
import { Imodelo } from '../interface/imodelo';


@Injectable({
  providedIn: 'root'
})
export class ModelosService {

  constructor(private http:HttpClient) { }

   private url:string = `${enviroment.urlServidor}Modelos`


  getData():Observable<Iresponse>{
    return this.http.get<Iresponse>(this.url);
  }



  /*=====================
Guaradar información 
  =======================*/

  postData(data : Imodelo):Observable<Iresponse>{

    return this.http.post<Iresponse>(this.url,data, httpOption);
  }


/*========================
  Actualizar información 
  ========================*/

  putData(data : Imodelo):Observable<Iresponse>{

    return this.http.put<Iresponse>(this.url,data, httpOption);
  }


  /*===================
  Elminiar información 
  =====================*/

  deleteData(id: number):Observable<Iresponse>{

    return this.http.delete<Iresponse>(`${this.url}/${id}`);
  }
}
