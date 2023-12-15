export interface IAuditoriaRepuestoTransaccion {
    audId: number
    audFecha : Date;
    audIdProducto : number;
    nombreProducto:string;
    audAlmacenOrigen : number;
    nombreAlmacenOrigen : string;
    audAlmacenDestino : number;
    nombreAlmacenDestino : string;
    audCantidadTransferida : number;
    audUsuario : number;
    nombreUsuario : string;

}
