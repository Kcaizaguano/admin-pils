import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { BehaviorSubject, Observable, map } from 'rxjs';
import { enviroment, httpOption } from '../enviroments/enviroments';
import { Ilogin } from '../interface/ilogin';
import { Iresponse } from '../interface/iresponse';
import { Iusuario } from '../interface/iusuario';



@Injectable({
  providedIn: 'root'
})
export class ApiauthService {

url: string =  enviroment.urlServidor+"User/login";
private usuarioSubject! : BehaviorSubject<Iusuario> ;

public get usuarioData(): Iusuario{
  return this.usuarioSubject.value;
}

  constructor(private http: HttpClient) {
    this.usuarioSubject =  new BehaviorSubject<Iusuario>(JSON.parse(localStorage.getItem('usuario')! ));
   }

  login(data : Ilogin): Observable<Iresponse> {

  return this.http.post<Iresponse>(this.url, data, httpOption).pipe(
    map(res => {
      if (res.exito === 1 ){
        const usuario: Iusuario = res.data;
        localStorage.setItem('usuario',JSON.stringify(usuario));
        this.usuarioSubject.next(usuario);
      }

      return res;
    })
  );
  }


  logout(){

    localStorage.removeItem('usuario');
    this.usuarioSubject.next(null!);

  }
}
