import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { enviroment, httpOption } from '../enviroments/enviroments';
import { Iresponse } from '../interface/iresponse';

@Injectable({
  providedIn: 'root'
})
export class ImagenesService {

  constructor(private httpClient: HttpClient) { }

  url:string = `${enviroment.urlServidor}Imagenes`

    /*=====================
    Guardar información 
    =======================*/

  post(file: File, carpeta: string): Observable<Iresponse> {
    const formData = new FormData();
    formData.append('Archivo', file);
    formData.append('folderName', carpeta);
  
    return this.httpClient.post<Iresponse>(this.url, formData , httpOption);
  }


  /*===================
  Elminiar información 
  =====================*/

  deleteImage(carpeta: string, nombreArchivo: string): Observable<Iresponse> {
    const params = { carpeta, nombreArchivo };
    return this.httpClient.delete<Iresponse>(this.url, { params });
  }

  
  
  
}
