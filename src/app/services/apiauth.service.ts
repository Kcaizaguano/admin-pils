import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs';
import { enviroment, httpOption } from '../enviroments/enviroments';
import { Ilogin } from '../interface/ilogin';
import { Iresponse } from '../interface/iresponse';



@Injectable({
  providedIn: 'root'
})
export class ApiauthService {

url: string =  enviroment.urlServidor+"User/login";

  constructor(private http: HttpClient) { }

  login(data : Ilogin): Observable<Iresponse> {

  return this.http.post<Iresponse>(this.url, data, httpOption);
  }
}
