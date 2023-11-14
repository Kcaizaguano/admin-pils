import { IdetalleVenta } from "./idetalle-venta";

export interface Iventa {

    facId: number ;
    facFecha: Date;
    facSubtotal:number ;
    facDescuento:number ;
    facIva:number ;
    facValorIva: number;
    facTotal:number ;
    facEstado:number ;
    facIdEmpleado: number;
    facIdCliente: number;
    facIdMetPago: number ;
    detalles: IdetalleVenta[];
}
