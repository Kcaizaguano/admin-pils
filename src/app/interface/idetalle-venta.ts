import { Iproducto } from "./iproducto";

export interface IdetalleVenta {

    detId:number,
    detIdFactura:number;
    detAlmacen:  number;
    detPrecio:  number;
    detCantidad:  number;
    detTotal: number;
    detIdProducto:  number;
    detEstado:  number;
    delDescuento:  number;
    producto?:Iproducto;

}
