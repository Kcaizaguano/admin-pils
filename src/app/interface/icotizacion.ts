import { IdetalleCotizacion } from "./idetalle-cotizacion";

export interface Icotizacion {

    
    cotId: number ;
    cotFecha: Date;
    cotSubtotal:number ;
    cotDescuento:number ;
    cotIva:number ;
    cotValorIva: number;
    cotTotal:number ;
    cotEstado:number ;
    cotIdCliente: number;
    cotIdMetPago: number ;
    detalles: IdetalleCotizacion[];
}
