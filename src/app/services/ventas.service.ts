import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { enviroment, httpOption } from '../enviroments/enviroments';
import { Iresponse } from '../interface/iresponse';
import { Observable } from 'rxjs';
import { Iventa } from '../interface/iventa';


@Injectable({
  providedIn: 'root'
})
export class VentasService {


  constructor(private http:HttpClient) { }

  private url:string = `${enviroment.urlServidor}Venta`


  /*===========================================
  Obtener listado de datos completos
  ===========================================*/
  getData():Observable<Iresponse>{
    return this.http.get<Iresponse>(this.url);
  }


  /*=====================
  Guardar información 
  =======================*/

  postData(data : Iventa):Observable<Iresponse>{

    return this.http.post<Iresponse>(this.url,data, httpOption);
  }


/*========================
  Actualizar información 
  ========================*/

  putData(data : Iventa):Observable<Iresponse>{

    return this.http.put<Iresponse>(this.url,data, httpOption);
  }


  /*========================
Tomar un item deacuerdo al  ID
  ========================*/

  getItem(id: string):Observable<Iresponse>{
    
    return this.http.get<Iresponse>(`${this.url}/${id}`);

  }

  /*========================
  Tomar data de la coleccion ventas apor rangos de fechas
  ========================*/

  getDataByDate( inicio: string, fin:string ):Observable<Iresponse>{

    return this.http.get<Iresponse>( `${this.url}/fechas?inicio="${inicio}"&fin="${fin}"` )
  }


}
