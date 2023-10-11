import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment, httpOption } from '../enviroments/enviroments';
import { Iresponse } from '../interface/iresponse';
import { Observable } from 'rxjs';
import { Imarca } from '../interface/imarca';

@Injectable({
  providedIn: 'root'
})
export class MarcasService {

  constructor(private http:HttpClient) { }

   private url:string = `${enviroment.urlServidor}Marcas`


  getData():Observable<Iresponse>{
    return this.http.get<Iresponse>(this.url);
  }



  /*=====================
Guaradar información 
  =======================*/

  postData(data : Imarca):Observable<Iresponse>{

    return this.http.post<Iresponse>(this.url,data, httpOption);
  }


/*========================
  Actualizar información 
  ========================*/

  putData(data : Imarca):Observable<Iresponse>{

    return this.http.put<Iresponse>(this.url,data, httpOption);
  }


  /*===================
  Elminiar información 
  =====================*/

  deleteData(id: number):Observable<Iresponse>{

    return this.http.delete<Iresponse>(`${this.url}/${id}`);
  }
}
