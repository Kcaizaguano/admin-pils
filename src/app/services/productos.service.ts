import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment, httpOption } from '../enviroments/enviroments';
import { Observable } from 'rxjs';
import { Iresponse } from '../interface/iresponse';
import { Iproducto } from '../interface/iproducto';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  constructor(private http:HttpClient) { }

   private url:string = `${enviroment.urlServidor}Products`

  /*===========================================
  Obtener listado de datos completos
  ===========================================*/
  getData():Observable<Iresponse>{
    return this.http.get<Iresponse>(this.url);
  }


  /*=====================
  Guardar información 
  =======================*/

  postData(data : Iproducto):Observable<Iresponse>{

    return this.http.post<Iresponse>(this.url,data, httpOption);
  }


/*========================
  Actualizar información 
  ========================*/

  putData(data : Iproducto):Observable<Iresponse>{

    return this.http.put<Iresponse>(this.url,data, httpOption);
  }


  /*========================
Tomar un item deacuerdo al  ID
  ========================*/

  getItem(id: string):Observable<Iresponse>{
    
    return this.http.get<Iresponse>(`${this.url}/${id}`);

  }


  /*===================
  Elminiar información 
  =====================*/

  deleteData(id: number):Observable<Iresponse>{

    return this.http.delete<Iresponse>(`${this.url}/${id}`);
  }


  /*===========================================
  Obtener listado de datos de la tabla Prodcutos-Almacén
  ===========================================*/
  getProductStore():Observable<Iresponse>{
    return this.http.get<Iresponse>(`${this.url}/almacenProductos`);
  }
}
