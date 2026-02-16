import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { enviroment } from "../enviroments/enviroments";
import { Observable } from "rxjs";
import { Iresponse } from "../interface/iresponse";

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

    constructor( private http:HttpClient) { }

    url:string = `${enviroment.urlServidor}Comun`

    totalInventario():Observable<Iresponse>{
        return this.http.get<Iresponse>(this.url);
    }
}