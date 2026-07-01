import { IdetalleCotizacion } from "./idetalle-cotizacion";
import { Iproducto } from "./iproducto";

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
