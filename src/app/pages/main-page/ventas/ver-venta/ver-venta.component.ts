import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Ialmacen } from 'src/app/interface/ialmacen';
import { IdetalleVenta } from 'src/app/interface/idetalle-venta';
import { CotizacionesService } from 'src/app/services/cotizaciones.service';
import { VentasService } from 'src/app/services/ventas.service';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { iva } from 'src/app/enviroments/enviroments';
import { Icliente } from 'src/app/interface/icliente';

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
  porcentajeIva = iva.etiqueta;
  valorIva = 0;
  total = 0;
  estadoFac = 0;
  metodoPago = 0;

  /*===========================================
  Variables  para detalle factura
  ===========================================*/
  detalle: any[] = [];
  almacenesListado: Ialmacen[] = [];


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
  nombreEmp = "";

  /*===========================================
  Variable  para saber si es cotizacion o factura
  ===========================================*/
  cotizacion = false;
  venta = false;

  constructor(private activatedRoute: ActivatedRoute,
    private ventasService: VentasService,
    private cotizacionesService: CotizacionesService
  ) { }

  ngOnInit(): void {
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
        this.porcentajeIva = resp.data.facIva;
        this.obtenerCliente(resp.data.cliente);
        this.metodoPago = resp.data.facIdMetPago;
        this.nombreEmp = resp.data.empleado;
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
            almacen: element.almacen,
            ubicacion: element.codigoPils
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
        this.porcentajeIva = resp.data.cotIva;
        this.total = resp.data.cotTotal;
        this.valorIva = resp.data.cotValorIva;
        this.obtenerCliente(resp.data.cliente);
        this.metodoPago = resp.data.cotIdMetPago;;
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
            almacen: element.almacen,
            ubicacion: element.codigoPils
          } as IdetalleVenta)
          this.detalle.push(detalle);
        });
      }
    )
  }

  /*===========================================
  Función para cargar datos del cliente
  ===========================================*/

  obtenerCliente(cliente: Icliente) {
    this.identificacion = cliente.cliIdentificacion;
    this.nombre = cliente.cliNombres;
    this.apellido = cliente.cliApellidos;
    this.direccion = cliente.cliDireccion;
    this.ciudad = ''; 
    this.email = cliente.cliEmail;
    this.telefono = cliente.cliTelefono;
  }


  /*===========================================
Función para cargar variables no recibidas
===========================================*/
  nombreIdAlmacen(id: number) { return this.almacenesListado.find(a => a.almId === id)?.almNombre; }

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

  generarPdf() {

    const element = document.getElementById('pdf');
    const fileName = 'Pils Autorepuetos ' + this.numeroFactura;
    html2canvas(element!).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 208;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      //pdf.save(fileName + '.pdf');
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);

      //window.open(url, '_blank');

      const newWindow = window.open(url);


    });

  }

}
