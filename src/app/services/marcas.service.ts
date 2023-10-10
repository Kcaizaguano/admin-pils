import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from '../enviroments/enviroments';
import { Iresponse } from '../interface/iresponse';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarcasService {

  constructor(private http:HttpClient) { }

   private url:string = `${enviroment.urlServidor}Marcas`


  getData():Observable<Iresponse>{
    return this.http.get<Iresponse>(this.url);
  }
}
