import { inject } from "@angular/core";
import { Router } from "@angular/router";

export const cargoGuard = (allowedRoles: string[]) => {
    return () => {
        const router = inject(Router);
        const usuario = JSON.parse(localStorage.getItem('usuario')!);

        if (usuario && allowedRoles.includes(usuario.cargo)) {
            return true;
        } else {
            router.navigate(['/']);
            return false;
        }
    };
};
