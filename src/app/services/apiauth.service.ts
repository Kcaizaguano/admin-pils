import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { BehaviorSubject, Observable, map } from 'rxjs';
import { enviroment, httpOption } from '../enviroments/enviroments';
import { Ilogin } from '../interface/ilogin';
import { Iresponse } from '../interface/iresponse';
import { Iusuario } from '../interface/iusuario';
import {  Router } from '@angular/router';



@Injectable({
  providedIn: 'root'
})
export class ApiauthService {

url: string =  enviroment.urlServidor+"User/login";
private usuarioSubject! : BehaviorSubject<Iusuario> ;

public get usuarioData(): Iusuario{
  return this.usuarioSubject.value;
}

  constructor(private http: HttpClient,
              private router : Router) {

/*===========================================
Verificar si existe un usuario conectado
===========================================*/
    this.usuarioSubject =  new BehaviorSubject<Iusuario>(JSON.parse(localStorage.getItem('usuario')! ));
   }

/*===========================================
LOGIN para la Autenticacion con el servidor
===========================================*/

  login(data : Ilogin): Observable<Iresponse> {
  return this.http.post<Iresponse>(this.url, data, httpOption).pipe(
    map(res => {
      if (res.exito === 1 ){

/*===========================================
Guardar al usuario cuando inicia session
===========================================*/
        const usuario: Iusuario = res.data;
        localStorage.setItem('usuario',JSON.stringify(usuario));
        this.usuarioSubject.next(usuario);
      }

      return res;
    })
  );
  }


  logout(){
/*===========================================
Borrar la sessión por completo 
===========================================*/
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    localStorage.removeItem('almacenes');
    localStorage.removeItem('refreshToken');
    this.usuarioSubject.next(null!);
    this.router.navigateByUrl("/login")

  }
}
