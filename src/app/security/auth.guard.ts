import { Injectable } from "@angular/core";
import { Router, CanActivate, ActivatedRouteSnapshot } from "@angular/router";
import { ApiauthService } from "../services/apiauth.service";

@Injectable({
    providedIn: 'root'
})

export class AuthGuard implements CanActivate {

    constructor(public router: Router,
        private apiauthService: ApiauthService
    ) { }

    canActivate(route: ActivatedRouteSnapshot) {

        const usuario = this.apiauthService.usuarioData;

        if (usuario) {

            /*===========================================
            Validar que el token si sea real
            ===========================================*/
            return true;
        }
        this.router.navigate(['/login'])
        return false;
    }
}