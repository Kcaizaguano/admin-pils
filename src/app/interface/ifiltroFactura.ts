import { Ifiltro } from "./ifiltro";

export interface IfiltroFactura extends Ifiltro {
    cedulaCliente? : string |null;
    estado? : number |null;
    idEmpleado? : number |null;
}
