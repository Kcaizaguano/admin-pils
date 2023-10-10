import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from '../enviroments/enviroments';
import { Iresponse } from '../interface/iresponse';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ModelosService {

  constructor(private http:HttpClient) { }

   private url:string = `${enviroment.urlServidor}Modelos`


  getData():Observable<Iresponse>{
    return this.http.get<Iresponse>(this.url);
  }
}
