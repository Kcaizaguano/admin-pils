import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Ialmacen } from 'src/app/interface/ialmacen';
import { IdetalleVenta } from 'src/app/interface/idetalle-venta';
import { Iproducto } from 'src/app/interface/iproducto';
import { AlmacenesService } from 'src/app/services/almacenes.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { CotizacionesService } from 'src/app/services/cotizaciones.service';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { ProductosService } from 'src/app/services/productos.service';
import { VentasService } from 'src/app/services/ventas.service';

@Component({
  selector: 'app-ver-venta',
  templateUrl: './ver-venta.component.html',
  styleUrls: ['./ver-venta.component.css']
})
export class VerVentaComponent implements OnInit {


  /*===========================================
  Variables  para  la factura
  ===========================================*/
  fecha: Date = new Date();
  numeroFactura = 0;
  subtotal = 0;
  descuentoTotal = 0;
  porcentajeIva = 12;
  valorIva = 0;
  total = 0;
  estadoFac = 0;
  metodoPago = 0;

  /*===========================================
  Variables  para detalle factura
  ===========================================*/
  detalle: any[] = [];
  almacenesListado: Ialmacen[] = [];
  productosListado: Iproducto[] = [];


  /*==============================
  Variables para el cliente
  ================================*/
  identificacion = "";
  nombre = "";
  apellido = "";
  email = "";
  direccion = "";
  ciudad = "";
  telefono = "";

    /*==============================
  Variables para el empleado
  ================================*/
  nombreEmp ="";

  /*===========================================
  Variable  para saber si es cotizacion o factura
  ===========================================*/
  cotizacion = false;
  venta = false;

  constructor(private activatedRoute: ActivatedRoute,
    private ventasService: VentasService,
    private clientesService: ClientesService,
    private productosService: ProductosService,
    private almacenesService: AlmacenesService,
    private empleadosService:EmpleadosService,
    private cotizacionesService:CotizacionesService
  ) { }

  ngOnInit(): void {


    this.cargarListado();
    setTimeout(() => {

      this.activatedRoute.params.subscribe((params) => {
        this.numeroFactura = params["id"]
  
  
        if (params['tipo'] == 'venta') {
          this.venta = true;
          this.cargarVenta(this.numeroFactura.toString());
  
        } else {
          this.cotizacion = true;
          this.cargarCotizacion(this.numeroFactura.toString());
  
        }
      })
    }, 500);
  }


  cargarListado() {

    this.almacenesService.getData().subscribe(
      resp => {
        this.almacenesListado = resp.data;
      }
    )

    this.productosService.getData().subscribe(
      resp => {
        this.productosListado = resp.data;
      }
    )


  }

  /*===========================================
  Función para cargar una venta
  ===========================================*/
  cargarVenta(id: string) {
    this.ventasService.getItem(id).subscribe(
      resp => {
        this.numeroFactura = resp.data.facId;
        this.fecha = resp.data.facFecha;
        this.descuentoTotal = resp.data.facDescuento;
        this.subtotal = resp.data.facSubtotal;
        this.total = resp.data.facTotal;
        this.valorIva = resp.data.facValorIva;
        this.obtenerCliente(resp.data.facIdCliente);
        this.metodoPago = resp.data.facIdMetPago;
        this.obtenerEmpleado(resp.data.facIdEmpleado);
        resp.data.detalles.forEach((element: any) => {
          const detalle: IdetalleVenta = ({
            detId: element.detId,
            detIdFactura: element.detIdFactura,
            detAlmacen: element.detAlmacen,
            detPrecio: element.detPrecio,
            detCantidad: element.detCantidad,
            detTotal: element.detTotal,
            detIdProducto: element.detIdProducto,
            detEstado: element.detEstado,
            delDescuento: element.delDescuento,
            repuesto: element.nombre,
            almacen: this.nombreIdAlmacen(element.detAlmacen),
            ubicacion: this.codPils(element.detIdProducto)
          } as IdetalleVenta)
          this.detalle.push(detalle);
        });
      }
    )
  }


  /*===========================================
  Función para cargar una cotización
  ===========================================*/
  cargarCotizacion(id: string) {
    this.cotizacionesService.getItem(id).subscribe(
      resp => {
        this.numeroFactura = resp.data.cotId;
        this.fecha = resp.data.cotFecha;
        this.descuentoTotal = resp.data.cotDescuento;
        this.subtotal = resp.data.cotSubtotal;
        this.total = resp.data.cotTotal;
        this.valorIva = resp.data.cotValorIva;
        this.obtenerCliente(resp.data.cotIdCliente);
        this.metodoPago=resp.data.cotIdMetPago;;
        resp.data.detalles.forEach((element: any) => {
          const detalle: IdetalleVenta = ({
            detId: element.detId,
            detIdFactura: element.detIdFactura,
            detAlmacen: element.detAlmacen,
            detPrecio: element.detPrecio,
            detCantidad: element.detCantidad,
            detTotal: element.detTotal,
            detIdProducto: element.detIdProducto,
            detEstado: element.detEstado,
            delDescuento: element.delDescuento,
            repuesto: element.nombre,
            almacen: this.nombreIdAlmacen(element.detAlmacen),
            ubicacion: this.codPils(element.detIdProducto)
          } as IdetalleVenta)
          this.detalle.push(detalle);
        });
      }
    )
  }

  /*===========================================
  Función para cargar datos del cliente
  ===========================================*/

  obtenerCliente(id: number) {
    this.clientesService.getItem(id).subscribe(
      res => {
        this.identificacion = res.data.cliIdentificacion;
        this.nombre = res.data.cliNombres;
        this.apellido = res.data.cliApellidos;
        this.direccion = res.data.cliDireccion;
        this.ciudad = res.data.ciudadNombre;
        this.email = res.data.cliEmail;
        this.telefono = res.data.cliTelefono;
      }
    )
  }


  /*===========================================
  Función para cargar datos del cliente
  ===========================================*/
  obtenerEmpleado(id: number){
    this.empleadosService.getItem(id.toString()).subscribe(
      res =>{
        this.nombreEmp = res.data.empNombres;
      }
    )

  }

  /*===========================================
Función para cargar variables no recibidas
===========================================*/
  nombreIdAlmacen(id: number) { return this.almacenesListado.find(a => a.almId === id)?.almNombre; }
  codPils(id: number) { return this.productosListado.find(p => p.proId === id)?.proCodPils; }

  nombreMetodoPago(id: number) {
    var nombre = "";
    switch (id) {
      case 1:
        nombre = "Efectivo"
        break;
      case 2:
        nombre = "Tarjeta"
        break;
      case 3:
        nombre = "Transferecia"
        break;
      default:
        nombre = "Desconocido"
        break;
    }

    return nombre;

  }


}
