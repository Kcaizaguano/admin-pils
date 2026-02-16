import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment, httpOption } from '../enviroments/enviroments';
import { Observable } from 'rxjs';
import { Iresponse } from '../interface/iresponse';
import { Icotizacion } from '../interface/icotizacion';
import { Ifiltro } from '../interface/ifiltro';

@Injectable({
  providedIn: 'root',
})
export class CotizacionesService {
  constructor(private http: HttpClient) {}

  private url: string = `${enviroment.urlServidor}Cotizacion`;

  /*===========================================
  Obtener listado de datos completos
  ===========================================*/
  getData(): Observable<Iresponse> {
    return this.http.get<Iresponse>(this.url);
  }

  /*=====================
  Guardar información 
  =======================*/

  postData(data: Icotizacion): Observable<Iresponse> {
    return this.http.post<Iresponse>(this.url, data, httpOption);
  }

  /*========================
  Actualizar información 
  ========================*/

  putData(data: Icotizacion): Observable<Iresponse> {
    return this.http.put<Iresponse>(this.url, data, httpOption);
  }

  /*========================
Tomar un item deacuerdo al  ID
  ========================*/

  getItem(id: string): Observable<Iresponse> {
    return this.http.get<Iresponse>(`${this.url}/${id}`);
  }

    /*========================
Tomar un item deacuerdo al  ID
  ========================*/

  getFilter(data: Ifiltro): Observable<Iresponse> {
    return this.http.post<Iresponse>(`${this.url}/filtro`, data, httpOption);
  }

  /*===================
  Elminiar información 
  =====================*/

  deleteData(id: number): Observable<Iresponse> {
    return this.http.delete<Iresponse>(`${this.url}/${id}`);
  }

    /*========================
Tomar el numero de cotizaciones
  ========================*/

  getNumberCotizacion(): Observable<Iresponse> {
    return this.http.get<Iresponse>(`${this.url}/cotizaciones-cantidad`);
  }
}
