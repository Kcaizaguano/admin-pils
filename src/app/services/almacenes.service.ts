import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from '../enviroments/enviroments';
import { Observable } from 'rxjs';
import { Iresponse } from '../interface/iresponse';

@Injectable({
  providedIn: 'root'
})
export class AlmacenesService {

  constructor(private http:HttpClient) { }

  url:string = `${enviroment.urlServidor}Almacenes`


  getData():Observable<Iresponse>{
    return this.http.get<Iresponse>(this.url);
  }
}
