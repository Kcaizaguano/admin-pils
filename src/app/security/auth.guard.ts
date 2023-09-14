import { Injectable } from "@angular/core";
import { Router, CanActivate, ActivatedRouteSnapshot } from "@angular/router";
import { Observable } from "rxjs";

@Injectable({
    providedIn:'root'
})

export class AuthGuard implements CanActivate{

    constructor( public router: Router ){}

    canActivate(route: ActivatedRouteSnapshot) {

        this.router.navigate(['/login'])
        
        
        return false;
    }
}