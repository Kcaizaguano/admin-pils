import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, throwError } from "rxjs";
import { ApiauthService } from "../services/apiauth.service";

@Injectable()

export class JwtInterceptor implements HttpInterceptor{

    constructor( private apiauthService:ApiauthService){}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const usuario = this.apiauthService.usuarioData;

        if (usuario) {
            request = request.clone({
                setHeaders:{
                    Authorization:`Bearer ${usuario.token}`
                }
            })
            
        }
        return next.handle(request).pipe(
            catchError((error) => {
                if (error.status === 401) {
                    this.apiauthService.logout();
                }
                return throwError(error);
            })
        )
    }



}