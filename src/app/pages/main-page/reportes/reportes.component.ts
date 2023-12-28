import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { alerts } from 'src/app/helpers/alerts';
import { Icliente } from 'src/app/interface/icliente';
import { Iproducto } from 'src/app/interface/iproducto';
import { AlmacenesService } from 'src/app/services/almacenes.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { DocumentosService } from 'src/app/services/documentos.service';
import { ProductosService } from 'src/app/services/productos.service';
import { VentasService } from 'src/app/services/ventas.service';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {



  /*========================================================
  variables globales para definir repuestos
  ==========================================================*/
  loadRepuestos = false;

  /*========================================================
  variables globales para definir el inventario de ventas
  ==========================================================*/
  loadVentas = false;
  loadGeneral = false;
  loadVentaTotal = false;
  loadMasvendido = false;
  loadVentaAlmacen = false;

  lstVentasFiltradas: any = [];

  /*========================================================
variables globales 
==========================================================*/
  loadClientes = false;
  lstClientes: any = [];



  /*================================
  variables para filtror
  =================================*/
  lstRepuestosMayoRotacion: any = [];
  almacenes: any = [];


  /*================================
  Rango de fechas
  =================================*/
  incioFecha = new Date(new Date().getFullYear(), 0, 1);//SE TRAE TODO LO DEL AÑO ACTUAL
  finFecha = new Date();
  fechaComoString = "";


  constructor(private documentosService: DocumentosService,
    private productosService: ProductosService,
    private clientesService: ClientesService,
    private ventasService: VentasService,
    private almacenesService: AlmacenesService
  ) {

  }

  ngOnInit(): void {
    this.cargarVentas();

    this.almacenesService.getData().subscribe(
      res => {
        this.almacenes = res.data;
      }
    )

  }






  /***************************************
  Función para obtener el reporte de  pedidos
  ****************************************/
  pedidoRepuestos() {

    alerts.confirmAlert("¿ Desea guardar la informacion de pedidos en un archivo de Excel ?", '', "info", "Si").then(
      (result) => {
        if (result.isConfirmed) {

          this.loadRepuestos = true;
          this.productosService.getData().subscribe(
            res => {
              var pedido: any = [];
              res.data.forEach((element: Iproducto) => {
                if (element.proStockMinimo >= element.proStockTotal) {
                  var pedir =
                  {

                    item: "",
                    marcas: this.obtenerMarcaID(element.marcas),
                    parte: element.proNumParte,
                    nombre: element.proNombre,
                    modelos: this.obtenerModeloID(element.modelos),
                    stockPils: element.proStockTotal,
                    pedido: "",
                    usd: "",
                    usdCopy: "",
                    originalTotal: "",
                    originalCopy: "",
                    nota: ""
                  };
                  pedido.push(pedir);
                }
              });
              pedido = pedido.sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));

              let itemCounter = 1;
              pedido.forEach((element: any) => {
                element.item = itemCounter++;
              });

              var header = [
                { name: 'ITEM', key: 'item' },
                { name: 'MARCA', key: 'marcas' },
                { name: 'NUMERO DE PARTE', key: 'parte' },
                { name: 'NOMBRE', key: 'nombre' },
                { name: 'Modelos', key: 'modelos' },
                { name: 'STOCK PILS', key: 'stockPils' },
                { name: 'CANTIDAD DE PEDIDO', key: 'pedido' },
                { name: 'ORIGINAL USD', key: 'usd' },
                { name: 'COPY USD', key: 'usdCopy' },
                { name: 'TOTAL ORIGINAL', key: 'originalTotal' },
                { name: 'TOTAL COPY', key: 'originalCopy' },
                { name: 'NOTE', key: 'nota' }
              ]

              this.documentosService.generarExcel(header, pedido, 'PedidoPils.xlsx');
              this.loadRepuestos = false;


            }
          )
        }
      }
    )

  }


  /*******************************
FUnción para repuestos de mayor rotacion
********************************/
  repuestosMayorRotacion() {


    var mayor: any = [];
    this.lstRepuestosMayoRotacion.forEach((element: any) => {
      const data = [element.id,
      element.nombre,
      element.cantidadVendida,
      element.precio
      ]

      mayor.push(data);

    });

    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text('Repuestos con Mayor Rotacion', 20, 20);

    autoTable(pdf, {
      head: [["Id", "Codigo Pils", "Cantidad Vendida", "Precio"]],
      body: [...mayor],
      startY: 30,
    });


    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url);

  }


  repuestosMayorStock() {

    alerts.confirmAlert("¿ Desea guardar esta información en PDF ?", '',"info","Si").then(
      (result)=> {
        if (result.isConfirmed){
          const doc = new jsPDF();
          doc.setFontSize(18);
          doc.text('Repuestos con mayor Stock', 20, 20);
          this.productosService.getData().subscribe(
            res => {
              var pedido: any = [];
              res.data.forEach((element: Iproducto) => {
                var umbral_proporcion = 6.0
                const proporcion_stock = element.proStockTotal / element.proStockMinimo;
                if (proporcion_stock > umbral_proporcion) {
                  const data = [element.proCodPils,
                  element.proNumParte,
                  element.proStockTotal,
                  element.proStockMinimo,
                  element.proPrecioCompra,
                  element.proPvpEfectivo
                  ];
                  pedido.push(data);
                }
              });
      
              autoTable(doc, {
                head: [["Codigo", "Número Parte", "Stock Total", "Stock Minimo", "Precio Compra", "Precio Venta"]],
                body: [...pedido],
                startY: 30,
              });
      
      
              const blob = doc.output('blob');
              const url = URL.createObjectURL(blob);
              window.open(url);
              //doc.save('table.pdf');
      
      
            }
          )
        }
      }
    )


  }

  reporteGeneral() {

    alerts.confirmAlert("¿ Desea guardar el reporte de inventario actual en un archivo de Excel ?",'', "info", "Si").then(
      (result) => {
        if (result.isConfirmed) {
          this.loadGeneral = true;

          this.productosService.getData().subscribe(
            resp => {

              let lista = Object.keys(resp.data).map(a => ({

                proId: resp.data[a].proId,
                proNumParte: resp.data[a].proNumParte,
                proNombre: resp.data[a].proNombre,
                proPrecioCompra: resp.data[a].proPrecioCompra,
                proPvpEfectivo: resp.data[a].proPvpEfectivo,
                proPvpTarjeta: resp.data[a].proPvpTarjeta,
                proDescripcion: resp.data[a].proDescripcion,
                proPresentacion: resp.data[a].proPresentacion,
                proUrlImagen: resp.data[a].proUrlImagen,
                proEstado: resp.data[a].proEstado,
                proStockTotal: resp.data[a].proStockTotal,
                proProvId: resp.data[a].proProvId,
                proStockMinimo: resp.data[a].proStockMinimo,
                proCodPils: resp.data[a].proCodPils,
                //proProveedor: this.proveedores.find(p => p.proId === resp.data[a].proProvId)?.proNombre,
                modelos: this.obtenerModeloID(resp.data[a].modelos),
                marcas: this.obtenerMarcaID(resp.data[a].marcas),
                almacen: this.obtenerAlmacenID(resp.data[a].almacen)

              } as Iproducto))

              lista = lista.sort((a: any, b: any) => a.proCodPils.localeCompare(b.proCodPils));

              var header = [
                { name: 'Cod. Pils', key: 'proCodPils' },
                { name: 'Numero Parte', key: 'proNumParte' },
                { name: 'Nombre', key: 'proNombre' },
                { name: 'Marcas', key: 'marcas' },
                { name: 'Modelos', key: 'modelos' },
                { name: 'Stock Total', key: 'proStockTotal' },
                { name: 'Almacenes', key: 'almacen' },
                { name: 'Pre.Compra', key: 'proPrecioCompra' },
                { name: 'Pre. Efectivo', key: 'proPvpEfectivo' },
                { name: 'Pre. Tarjeta', key: 'proPvpTarjeta' },
                { name: 'Stock Mínimo', key: 'proStockMinimo' },
                { name: 'Presentacion', key: 'proPresentacion' },
                { name: 'Proveedor', key: 'proProvId' },
                { name: 'Descripción', key: 'proDescripcion' },
                { name: 'Imagen', key: 'proUrlImagen' },
                { name: 'Estado', key: 'proEstado' },
              ]
              this.documentosService.generarExcel(header, lista, 'Inventario Actual.xlsx');
              this.loadGeneral = false;
            }
          )
        }
      }
    )
  }

  /*******************************
Inventario de ventas 
********************************/
  cargarVentas() {

    this.loadVentas = true;

    //FILTRAR LAS VENTAS POR FECHAS
    this.fechaComoString = "Desde " + this.incioFecha.toISOString().split('T')[0] + " hasta " + this.finFecha.toISOString().split('T')[0];

    this.ventasService.getDataByDate(this.incioFecha.toISOString(), this.finFecha.toISOString()).subscribe(
      (res: any) => {
        this.lstVentasFiltradas = res.data;

      }
    )
  }

  onAlmacenChange(event: any): void {

    const mensaje = "¿ Desea guardar las ventas del almacén " + event.almNombre + " en un archivo de Excel ?"
    alerts.confirmAlert(mensaje, this.fechaComoString, "info", "Si").then(
      (result) => {
        if (result.isConfirmed) {
          this.loadVentaAlmacen = true;
          let lst = this.lstVentasFiltradas.filter((v: any) => v.idAlmacen == event.almId);
          if (lst.length > 0) {
            let ventaTotal: any = [];
            lst.forEach((element: any) => {

              var venta = {
                Id: element.facId,
                Cliente: element.cliente,
                Empleado: element.empleado,
                Fecha: element.facFecha.split('T')[0],
                Metodo: this.metodoPago(element.facIdMetPago),
                Subtotal: element.facSubtotal,
                Descuento: element.facDescuento,
                Iva: element.facValorIva,
                Total: element.facTotal
              }
              ventaTotal.push(venta);
            })
            const archivo = "Venta " + event.almNombre + " " + this.fechaComoString + ".xlsx"
            this.documentosService.generaExelSinEncabezados(ventaTotal, archivo);
            this.loadVentaAlmacen = false;


          } else {
            alerts.basicAlert('No hay datos para mostrar', '', 'info');
            this.loadVentaAlmacen = false;
          }

        }
      }
    )




  }

  /*******************************
  Generar reporte de la venta total
  ********************************/
  reporteVentaTotal() {


    alerts.confirmAlert("¿ Desea guardar el total de ventas en un archivo de Excel ?", this.fechaComoString, "info", "Si").then(
      (result) => {
        if (result.isConfirmed) {
          this.loadVentaTotal = true;
          let ventaTotal: any = [];
          this.lstVentasFiltradas.forEach((element: any) => {

            var venta = {
              Id: element.facId,
              Almacen: element.almacen,
              Cliente: element.cliente,
              Empleado: element.empleado,
              Fecha: element.facFecha.split('T')[0],
              Metodo: this.metodoPago(element.facIdMetPago),
              Subtotal: element.facSubtotal,
              Descuento: element.facDescuento,
              Iva: element.facValorIva,
              Total: element.facTotal
            }

            ventaTotal.push(venta);

          });

          const archivo = "Venta Total" + this.fechaComoString + ".xlsx"
          this.documentosService.generaExelSinEncabezados(ventaTotal, archivo);
          this.loadVentaTotal = false;

        }
      }

    )
  }

  repuestosMasVendidos() {

    alerts.confirmAlert("¿ Te gustaría almacenar la información de los repuestos más vendidos en un archivo de Excel ?", this.fechaComoString, "info", "Si").then(
      (result) => {
        if (result.isConfirmed) {
          const lst = this.obtenerProductosMasVendidos(this.lstVentasFiltradas)
          const archivo = "Repuestos mas Vendidos " + this.fechaComoString + ".xlsx"
          this.documentosService.generaExelSinEncabezados(lst, archivo);

        }
      }
    )



  }

  /*******************************
  Obtener los productos + vendidos
  ********************************/

  obtenerProductosMasVendidos(listaDeFacturas: any): any[] {

    this.lstRepuestosMayoRotacion = [];

    // Organiza la lista de detalles de todas las facturas en un solo array
    const detallesDeTodasLasFacturas = listaDeFacturas
      .map((factura: any) => factura.detalles)
      .reduce((detallesAnteriores: any, detallesActuales: any) => detallesAnteriores.concat(detallesActuales), []);

    // Agrupa los detalles por el id del producto y suma las cantidades vendidas
    const productosVendidos = detallesDeTodasLasFacturas.reduce((productos: any, detalle: any) => {
      const idProducto = detalle.detIdProducto;
      if (productos[idProducto]) {
        productos[idProducto].cantidadVendida += detalle.detCantidad;
      } else {
        productos[idProducto] = {
          id: idProducto,
          codigo: detalle.codigoPils, // Reemplaza con el nombre real del producto
          cantidadVendida: detalle.detCantidad,
          precio: detalle.detPrecio,
          nombre: detalle.nombre
        };
      }
      return productos;
    }, {});

    // Convierte el objeto de productos de nuevo en un array
    const productosVendidosArray = Object.values(productosVendidos);

    // Ordena el array por la cantidad vendida de manera descendente
    const salida = productosVendidosArray.sort((a: any, b: any) => b.cantidadVendida - a.cantidadVendida);

    return salida;
  }


  reporteClientes(){

    alerts.confirmAlert("¿ Desea guardar esta información en PDF ?", '' ,"info","Si").then(
      (result)=> {
        if (result.isConfirmed){
          this.loadClientes= true;
          const doc = new jsPDF();
          doc.setFontSize(18);
          doc.text('Listado de Clientes', 20, 20);
          this.clientesService.getData().subscribe(
            res => {
              var clientes: any = [];
              res.data.forEach((element: Icliente) => {
                  const data = [element.cliId,
                  element.cliIdentificacion,
                  element.cliNombres,
                  element.cliApellidos,
                  element.cliDireccion,
                  element.cliEmail,
                  element.cliTelefono
                  ];
                  clientes.push(data);
              });
      
              autoTable(doc, {
                head: [["Id", "Identificacioón", "Nombres", "Apellidos", "Dirección", "Email",'Teléfono']],
                body: [...clientes],
                startY: 30,
              });
      
      
              const blob = doc.output('blob');
              const url = URL.createObjectURL(blob);
              window.open(url);
              //doc.save('table.pdf');
              this.loadClientes= false;
      
            }
          )
        }
      }
    )


  }





  metodoPago(facIdMetPago: any) {

    switch (facIdMetPago) {
      case 1:
        return "Efectivo"
      case 2:
        return "Tarjeta"
      case 3:
        return "Transferencia"
      default:
        return "Desconocido"
    }

  }




  /*===========================================
  Función  cambio de id por nombre de marcas 
  ===========================================*/

  obtenerMarcaID(lst: any) {
    let valores: string = "";
    lst.forEach((element: any) => {
      valores += element.marca + ", ";
    });

    return valores;

  }

  /*===========================================
  Función  cambio de id por nombre de  modelos
  ===========================================*/

  obtenerModeloID(lst: any) {
    let valores: string = "";
    lst.forEach((element: any) => {
      valores += element.modelo + ", "
    });

    return valores;

  }

  obtenerAlmacenID(lst: any) {
    let valores: string = "";

    lst.forEach((element: any) => {
      valores += element.almacen + ": " + element.stock + ", "

    });

    return valores

  }

}
