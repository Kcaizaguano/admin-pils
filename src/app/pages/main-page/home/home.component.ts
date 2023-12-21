import { supportsScrollBehavior } from '@angular/cdk/platform';
import { Component, OnInit } from '@angular/core';
import { sample } from 'rxjs';
import { functions } from 'src/app/helpers/functions';
import { Icliente } from 'src/app/interface/icliente';
import { Icompra } from 'src/app/interface/icompra';
import { Icotizacion } from 'src/app/interface/icotizacion';
import { Iempleados } from 'src/app/interface/iempleados';
import { Iproveedor } from 'src/app/interface/iproveedor';
import { ClientesService } from 'src/app/services/clientes.service';
import { ComprasService } from 'src/app/services/compras.service';
import { CotizacionesService } from 'src/app/services/cotizaciones.service';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { ProductosService } from 'src/app/services/productos.service';
import { ProveedoresService } from 'src/app/services/proveedores.service';
import { VentasService } from 'src/app/services/ventas.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {




  /*========================================================
  variables globales para definir el inventario de repuestos
  ==========================================================*/
  repuestos = 0;
  loadRepuestos = false;

  /*========================================================
  variables globales para definir el inventario de ventas
  ==========================================================*/
  ventas = 0;
  loadVentas = false;

  /*========================================================
variables globales para definir el inventario de clientes
==========================================================*/
  clientes = 0;
  loadClientes = false;
  lstClientes!:Icliente[];

  /*========================================================
variables globales para definir el inventario de empleados
==========================================================*/
  empleados = 0;
  loadEmpleados = false;
  lstEmpleados!:Iempleados[];

  /*========================================================
variables globales para definir el inventario de cotizaciones
==========================================================*/
  cotizaciones = 0;
  loadCotizaciones = false;

  /*================================
  Angular google charts 
  =================================*/
  chart: any = {
    type: "AreaChart", //TIPO DE GRAFICO QUE ACEPTA EL PLUGINS
    data: [],
    //PARA DATA LO QUE ESTA EN LA [0] ES X  , [1] ES Y
    columnNames: ['Fecha', 'Total'], //COMO SE LLAMAN LAS COLUMNAS X,Y
    options: {
      colors: ['#5F77BB']
    }
  }

  totalVenta = 0;



  /*================================
  Rango de fechas
  =================================*/
  incioFecha = new Date(new Date().getFullYear(), 0, 1);//SE TRAE TODO LO DEL AÑO ACTUAL
  finFecha = new Date();

  /*================================
  Últimas Compras 
  =================================*/
  loadUltimasCompras = false;
  ultimasCompras: any = [];


  /*================================
  cotizaciones recientes
  =================================*/
  cotizacionesRecientes: any = [];


  /*================================
  Angular google charts productos 
  =================================*/
  barras: any = {
    type: "Bar", //TIPO DE GRAFICO QUE ACEPTA EL PLUGINS
    data: [],
    //PARA DATA LO QUE ESTA EN LA [0] ES X  , [1] ES Y
    columnNames: ['Repuesto', 'Cantidad',{ role: 'annotation' }], //COMO SE LLAMAN LAS COLUMNAS X,Y
    options: {
      colors: ['#00008F'],
      legend: 'none' ,
      hAxis: {
        title: 'Cantidad Vendida'
      },
      vAxis: {
        title: 'Repuestos'
      },
      bars: 'horizontal',
      bar: {
        groupWidth: '85%' 
      },
      annotation: {
        textStyle: {
          fontSize: 0.4 // Ajusta el tamaño de la letra para las anotaciones
        },
  
      }
    }
  }


  /*================================
  variables para clientes destacados
  =================================*/
  clienteElite="";
  empleadoDestacado: any="";
  mesTop="";
  lstProveedores:Iproveedor[] = [];

  constructor(private productosService: ProductosService,
    private ventasService: VentasService,
    private clientesService: ClientesService,
    private empleadosService: EmpleadosService,
    private cotizacionesService: CotizacionesService,
    private proveedoresService:ProveedoresService,
    private comprasService:ComprasService
  ) {

  }


  ngOnInit(): void {

    this.cargarProveedores();
    this.cargarProductos();
    this.cargarEmpleados();
    this.cargarClientes();
    setTimeout(() => {
      this.cargarCotizaciones();
      this.cargarVentas();
      this.ultimas5Compras();
    }, 1000);



  }

  /*******************************
  Inventario de productos 
  ********************************/
  cargarProductos() {
    this.loadRepuestos = true;
    this.productosService.getData().subscribe(
      resp => {
        this.repuestos = Object.keys(resp.data).length;
        this.loadRepuestos = false;
      }
    )
  }

  /*******************************
Inventario de ventas 
********************************/
  cargarVentas() {

    this.loadVentas = true;
    this.chart.data = [];
    this.barras.data=[];
    this.clienteElite="";
    this.empleadoDestacado="";
    this.mesTop="";

    //TOTAL DE VENTAS
    this.ventasService.getData().subscribe(
      resp => {
        this.ventas = Object.keys(resp.data).length;
        this.loadVentas = false;
      }
    )

    //FILTRAR LAS VENTAS POR FECHAS

    this.ventasService.getDataByDate(this.incioFecha.toISOString(), this.finFecha.toISOString()).subscribe(
      (res: any) => {

        //SEPARAR MES Y TOTAL

        const ventas: any = Object.keys(res.data).map((a) => ({

          //si se necesita controlar el estado de las ventas ver 11:34 - parte 2 graficos
          fecha: res.data[a].facFecha.substring(0, 7),
          total: res.data[a].facTotal,

        }))

        //ORDENAR DE MENOR A MAYOR LAS FECHAS

        ventas.sort((a: any, b: any) => {
          if (a.fecha < b.fecha) return -1;
          if (a.fecha > b.fecha) return 1;
          return 0
        })

        //SUMAR TOTAL EN MES REPETIDO
        let result = ventas.reduce((r: any, o: any) => (r[o.fecha] ? (r[o.fecha].total += o.total) : (r[o.fecha] = { ...o }), r), {});

        // AGREGAR EL ARREGLO A LA DATA DEL GRAFICO
        Object.keys(result).map(a => {
          const data = [result[a].fecha, result[a].total];

          this.chart.data.push(data);
        })
        //SUMAR EL TOTAL DE VENTAS 
        this.chart.data.forEach((element: any) => {
          this.totalVenta += element[1]

        });

        //GRAFICO DE PRODUCTOS MAS VENDIDOS

        const top5Repuestos = this.obtenerProductosMasVendidos(res.data);
        Object.keys(top5Repuestos).map((a:any) => {
          const data = [ top5Repuestos[a].nombre, top5Repuestos[a].cantidadVendida,'eqtiqeu'];
          this.barras.data.push(data);
        })

        //CLIENTE QUE MAS COMPRA
        //this.obtenerClienteQueMasCompra(res.data)
        let idCli = this.obtenerClienteQueMasCompra(res.data).id;
        this.clienteElite= this.lstClientes.find(e => e.cliId ===  idCli)?.cliNombres +' '+
                                  this.lstClientes.find(e => e.cliId === idCli )?.cliApellidos ;
        //MEJOR EMPLEADO
        let idEmpl = this.obtenerEmpleadoQueMasVende(res.data).id;
        this.empleadoDestacado= this.lstEmpleados.find(e => e.empId ===  idEmpl)?.empNombres +' '+
                                  this.lstEmpleados.find(e => e.empId === idEmpl )?.emplApellidos ;
        //MES QUE MAS SE VENDE 
        this.mesTop=this.obtenerMesEnQueSeVendeMas(res.data)

      }
    )



  }

  /*******************************
Inventario de Empleados 
********************************/
  cargarEmpleados() {

    this.loadEmpleados = true;
    this.empleadosService.getData().subscribe(
      resp => {
        this.empleados = Object.keys(resp.data).length;
        this.lstEmpleados= resp.data;
        this.loadEmpleados = false;

      }
    )
  }


  /*******************************
  Inventario de Clientes 
  ********************************/
  cargarClientes() {
    this.loadClientes = true
    this.clientesService.getData().subscribe(
      resp => {
        this.clientes = Object.keys(resp.data).length;
        this.lstClientes = resp.data;
        this.loadClientes = false;
      }
    )

  }


  /*******************************
  Inventario de Cotizaciones 
  ********************************/
  cargarCotizaciones() {

    this.loadCotizaciones = true;

    this.cotizacionesService.getData().subscribe(
      resp => {

        this.cotizacionesRecientes = Object.keys(resp.data).map(a => ({

          cotId:   resp.data[a].cotId,
          cotFecha:  resp.data[a].cotFecha,
          cotSubtotal: resp.data[a].cotSubtotal,
          cotDescuento: resp.data[a].cotDescuento,
          cotIva: resp.data[a].cotIva,
          cotValorIva:  resp.data[a].cotValorIva,
          cotTotal: resp.data[a].cotTotal,
          cotEstado: resp.data[a].cotEstado,
          cotIdEmpleado:  resp.data[a].cotIdEmpleado,
          cotIdCliente:  resp.data[a].cotIdCliente,
          cotIdMetPago:  resp.data[a].cotIdMetPago,
          detalles:  resp.data[a].detalles,
          cliNombres:this.lstClientes.find(n => n.cliId === resp.data[a].cotIdCliente )?.cliApellidos + ' '+
                      this.lstClientes.find(n => n.cliId === resp.data[a].cotIdCliente )?.cliNombres 

      } as Icotizacion))

        this.cotizacionesRecientes = this.cotizacionesRecientes.slice(0,5)

        this.loadCotizaciones = false;
      }
    )
  }


  /*******************************
  Inventario de Compras 
  ********************************/
  ultimas5Compras() {

    this.loadUltimasCompras = true;

    this.comprasService.getData().subscribe(
      resp => {

        this.ultimasCompras = Object.keys(resp.data).map(a => ({

          comId:   resp.data[a].comId,
          comNumOrden: resp.data[a].comNumOrden,
          comFecha: resp.data[a].comFecha,
          comProveedor : resp.data[a].comProveedor,
          nombreProveedor:this.lstProveedores.find(p => p.proId ===  resp.data[a].comProveedor )?.proNombre,
          comDescripcion : resp.data[a].comDescripcion,
          comTotal: resp.data[a].comTotal,
          detalles : resp.data[a].detalles

        } as Icompra))

        this.ultimasCompras =this.ultimasCompras.slice(0,5)
        this.loadUltimasCompras = false;

      }
    )

  }
  /*******************************
  Inventario de productos 
  ********************************/
  cargarProveedores() {
    this.proveedoresService.getData().subscribe(
      resp => {
        this.lstProveedores = resp.data;
      }
    )
  }


  /*******************************
  Obtener los 5 productos + vendidos
  ********************************/

  obtenerProductosMasVendidos(listaDeFacturas : any): any[] {
    // Organiza la lista de detalles de todas las facturas en un solo array
    const detallesDeTodasLasFacturas = listaDeFacturas
      .map((factura:any) => factura.detalles)
      .reduce((detallesAnteriores : any, detallesActuales: any) => detallesAnteriores.concat(detallesActuales), []);

    // Agrupa los detalles por el id del producto y suma las cantidades vendidas
    const productosVendidos = detallesDeTodasLasFacturas.reduce((productos: any, detalle: any) => {
      const idProducto = detalle.detIdProducto;
      if (productos[idProducto]) {
        productos[idProducto].cantidadVendida += detalle.detCantidad;
      } else {
        productos[idProducto] = {
          id: idProducto,
          nombre:  detalle.nombre , // Reemplaza con el nombre real del producto
          cantidadVendida: detalle.detCantidad
        };
      }
      return productos;
    }, {});

    // Convierte el objeto de productos de nuevo en un array
    const productosVendidosArray = Object.values(productosVendidos);

    // Ordena el array por la cantidad vendida de manera descendente
    productosVendidosArray.sort((a:any, b:any) => b.cantidadVendida - a.cantidadVendida);

    // Obtiene los primeros 5 productos
    const primerosCincoProductos = productosVendidosArray.slice(0, 5);

    return primerosCincoProductos;
  }


  /*******************************
  Obtener el mejor cliente
  ********************************/
  obtenerClienteQueMasCompra(listaDeFacturas:any): any {
    // Agrupa las facturas por el id del cliente y suma los totales comprados
    const clientesCompradores = listaDeFacturas.reduce((clientes:any, factura:any) => {
      const idCliente = factura.facIdCliente;
      if (clientes[idCliente]) {
        clientes[idCliente].totalComprado += factura.facTotal;
      } else {
        clientes[idCliente] = {
          id: idCliente,
          nombre: factura.nombreDelCliente, // Reemplaza con el nombre real del cliente
          totalComprado: factura.facTotal
        };
      }
      return clientes;
    }, {});

    // Convierte el objeto de clientes de nuevo en un array
    const clientesCompradoresArray = Object.values(clientesCompradores);

    // Ordena el array por el total comprado de manera descendente
    clientesCompradoresArray.sort((a:any, b:any) => b.totalComprado - a.totalComprado);

    // Obtiene el cliente que más compra
    const clienteQueMasCompra = clientesCompradoresArray.length > 0 ? clientesCompradoresArray[0] : null;

    return clienteQueMasCompra;
  }

  obtenerEmpleadoQueMasVende(listaDeFacturas: any): any {
    // Agrupa las facturas por el id del empleado y suma los totales vendidos
    const empleadosVendedores = listaDeFacturas.reduce((empleados:any, factura:any) => {
      const idEmpleado = factura.facIdEmpleado;
      if (empleados[idEmpleado]) {
        empleados[idEmpleado].totalVendido += factura.facTotal;
      } else {
        empleados[idEmpleado] = {
          id: idEmpleado,
          nombre: factura.nombreDelEmpleado, // Reemplaza con el nombre real del empleado
          totalVendido: factura.facTotal
        };
      }
      return empleados;
    }, {});

    // Convierte el objeto de empleados de nuevo en un array
    const empleadosVendedoresArray = Object.values(empleadosVendedores);

    // Ordena el array por el total vendido de manera descendente
    empleadosVendedoresArray.sort((a:any, b:any) => b.totalVendido - a.totalVendido);

    // Obtiene el empleado que más vende
    const empleadoQueMasVende = empleadosVendedoresArray.length > 0 ? empleadosVendedoresArray[0] : null;

    return empleadoQueMasVende;
  }


  obtenerMesEnQueSeVendeMas(listaDeFacturas : any): string {
    // Agrupa las facturas por el mes y suma los totales vendidos
    const ventasPorMes = listaDeFacturas.reduce((ventas: any, factura: any) => {
      const mes = new Date(factura.facFecha).toLocaleString('default', { month: 'long' });
      if (ventas[mes]) {
        ventas[mes] += factura.facTotal;
      } else {
        ventas[mes] = factura.facTotal;
      }
      return ventas;
    }, {});

    // Encuentra el mes con mayores ventas
    const mesConMasVentas = Object.keys(ventasPorMes).reduce((mesActual, mesSiguiente) =>
      ventasPorMes[mesSiguiente] > ventasPorMes[mesActual] ? mesSiguiente : mesActual
    );

    return mesConMasVentas.toUpperCase();
  }

}
