import { IdetalleCompra } from "./idetalle-compra";

export interface Icompra {

    comId : number ;
    comNumOrden: string;
    comFecha: Date ;
    comProveedor : number ;
    nombreProveedor : string ;
    comDescripcion : string ;
    comTotal: number ;
    detalles : IdetalleCompra[];

}
