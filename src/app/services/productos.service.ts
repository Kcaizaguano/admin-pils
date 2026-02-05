import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment, httpOption } from '../enviroments/enviroments';
import { Observable } from 'rxjs';
import { Iresponse } from '../interface/iresponse';
import { Iproducto } from '../interface/iproducto';
import { IproductoMarcas } from '../interface/iproductoMarcas ';
import { IproductoModelos } from '../interface/iproducto-modelos';
import { IproductoAlmacen } from '../interface/iproducto-almacen';
import { IproductoFilter } from '../interface/iproductoFilter';

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

  /*===========================================
  Obtener listado de productos filtrado
  ===========================================*/
  getFilterData(data : IproductoFilter):Observable<Iresponse>{
    return this.http.post<Iresponse>(`${this.url}/filtro`,data, httpOption);
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

  /*=====================
  Guardar información de  los almacenes de los productos
  =======================*/

  postAlmacenData(data : IproductoAlmacen):Observable<Iresponse>{

    return this.http.post<Iresponse>(`${this.url}/almacenProductos`,data, httpOption);
  }


  /*=====================
  Actualizar información de  los almacenes de los productos
  =======================*/

  putAlmacenData(data : IproductoAlmacen):Observable<Iresponse>{

    return this.http.put<Iresponse>(`${this.url}/almacenProductos`,data, httpOption);
  }

  /*===================
  Elminiar información de la marca 
  =====================*/

  deleteDataAlmacen(id: number):Observable<Iresponse>{

    return this.http.delete<Iresponse>(`${this.url}/almacenProductos/${id}`);
  }


  /*=====================
  Guardar información de las marcas de los productos
  =======================*/

  postMarcaData(data : IproductoMarcas):Observable<Iresponse>{

    return this.http.post<Iresponse>(`${this.url}/marcasProductos`,data, httpOption);
  }

  /*===================
  Elminiar información de la marca 
  =====================*/

  deleteDataMarca(id: number):Observable<Iresponse>{

    return this.http.delete<Iresponse>(`${this.url}/marcasProductos/${id}`);
  }



  /*=====================
  Guardar información de los modelos de los productos
  =======================*/

  postModeloData(data : IproductoModelos):Observable<Iresponse>{

    return this.http.post<Iresponse>(`${this.url}/modelosProductos`,data, httpOption);
  }

  /*===================
  Elminiar información del modelo
  =====================*/

  deleteDataModelo(id: number):Observable<Iresponse>{
    return this.http.delete<Iresponse>(`${this.url}/modelosProductos/${id}`);
  }


  /*===================
  Transaccion de un producto
  =====================*/

  transaccionProducto(caso: number , data : IproductoAlmacen ):Observable<Iresponse>{
      return this.http.put<Iresponse>(`${this.url}/almacenTransaccion/${caso}`,data, httpOption);
  }

}
