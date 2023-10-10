import { IUsersLogin } from "./i-users-login";

export interface Iempleados {
    empId: number ;
    empNombres:string ;
    empCedula:string ;
    emplApellidos:string ;
    empDireccion:string ;
    empTelefono :string;
    empEmail:string ;
    empGenero:string ;
    empEstadoCivil:string ;
    empIdAlmacen:number ;
    empUrlImagen:string ;
    usuario : IUsersLogin;
    empActivo : number;
}
