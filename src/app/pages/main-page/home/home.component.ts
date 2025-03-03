import { Component, OnInit } from '@angular/core';
import { Icliente } from 'src/app/interface/icliente';
import { Icompra } from 'src/app/interface/icompra';
import { Iempleados } from 'src/app/interface/iempleados';
import { ClientesService } from 'src/app/services/clientes.service';
import { ComprasService } from 'src/app/services/compras.service';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { ProductosService } from 'src/app/services/productos.service';
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
  lstClientes!: Icliente[];

  /*========================================================
variables globales para definir el inventario de empleados
==========================================================*/
  empleados = 0;
  loadEmpleados = false;
  lstEmpleados!: Iempleados[];


  /*================================
  Angular google charts 
  =================================*/
  chart: any = {
    type: "AreaChart", //TIPO DE GRAFICO QUE ACEPTA EL PLUGINS
    data: [],
    //PARA DATA LO QUE ESTA EN LA [0] ES X  , [1] ES Y
    columnNames: ['Fecha', 'Total'], //COMO SE LLAMAN LAS COLUMNAS X,Y
    options: {
      colors: ['#5F77BB'],
      legend: 'none',
      vAxis: {
        format: '$#,##0.00', // Esto agrega el formato de moneda al eje Y
      },
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
    type: "BarChart", //TIPO DE GRAFICO QUE ACEPTA EL PLUGINS
    data: [],
    //PARA DATA LO QUE ESTA EN LA [0] ES X  , [1] ES Y
    columnNames: ['Repuesto', 'Cantidad', { role: 'annotation' }], //COMO SE LLAMAN LAS COLUMNAS X,Y
    options: {
      colors: ['#00008F'],
      legend: 'none',
      hAxis: {
        title: 'Cantidad Vendida'
      },
      vAxis: {
        title: 'Repuestos'
      },
      bars: 'horizontal',
      bar: {
        groupWidth: '80%'
      },
      annotation: {
        textStyle: {
          fontSize: 0.1 // Ajusta el tamaño de la letra para las anotaciones
        },

      }
    }
  }


  /*================================
  variables para clientes destacados
  =================================*/
  clienteElite = "";
  totalCLiente=0;
  empleadoDestacado: any = "";
  totalEmpleado = 0;
  lstMesesTop:any;
  lstClientesTop:any;
  lstEmpleadosTop:any;


  /*================================
  variables para filtror
  =================================*/
  lstRepuestosMayoRotacion:any = [];

  


  /*================================
  Angular google grafico circular
  =================================*/
  cirular: any = {
    type: "PieChart", //TIPO DE GRAFICO QUE ACEPTA EL PLUGINS
    data: [],
    //PARA DATA LO QUE ESTA EN LA [0] ES X  , [1] ES Y
    columnNames: ['Almacén', 'Total'], //COMO SE LLAMAN LAS COLUMNAS X,Y
    options: {
      pieHole: 0.4,
    }
  }
  


  constructor(private productosService: ProductosService,
    private ventasService: VentasService,
    private clientesService: ClientesService,
    private empleadosService: EmpleadosService,
    private comprasService: ComprasService,
  ) {

  }


  ngOnInit(): void {

    this.cargarProductos();
    this.cargarEmpleados();
    this.cargarClientes();
    setTimeout(() => {
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
    this.cirular.data=[];
    this.barras.data = [];
    this.clienteElite = "";
    this.empleadoDestacado = "";
    this.lstMesesTop=[];
    this.lstEmpleadosTop=[];
    this.lstClientesTop=[];
    this.totalVenta=0;
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
        console.log("res: ", res.data);
        //SEPARAR MES Y TOTAL
        var ventas: any = Object.keys(res.data).map((a) => ({

          //si se necesita controlar el estado de las ventas ver 11:34 - parte 2 graficos
          fecha: res.data[a].facFecha.substring(0, 7),
          total: res.data[a].facTotal,
          idAlmacen: res.data[a].idAlmacen,
          nombreAlmacen: res.data[a].almacen

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

        //GRAFICO PARA EL TOTAL DE ALMACENES 

        //SUMAR TOTAL DE ALMACÉN REPETIDO
        let totalPorAlmacen = ventas.reduce((r: any, o: any) => {
          const key = o.idAlmacen;
          if (r[key]) {
              r[key].total += o.total;
          } else {
              r[key] = { ...o };
          }

          return r;
        }, {});


        Object.keys(totalPorAlmacen).map((a: any) => {
          const data = [totalPorAlmacen[a].nombreAlmacen, totalPorAlmacen[a].total];
          this.cirular.data.push(data);
        })


        //GRAFICO DE PRODUCTOS MAS VENDIDOS

        const top5Repuestos = this.obtenerProductosMasVendidos(res.data);
        Object.keys(top5Repuestos).map((a: any) => {
          const data = [top5Repuestos[a].nombre, top5Repuestos[a].cantidadVendida, top5Repuestos[a].nombreCorto];
          this.barras.data.push(data);
        })

        //CLIENTE QUE MAS COMPRA
        this.lstClientesTop = this.obtenerClienteQueMasCompra(res.data);

        //MEJOR EMPLEADO
        let empleado = this.obtenerEmpleadoQueMasVende(res.data);
        this.totalEmpleado = empleado.totalVendido;
        this.empleadoDestacado = this.lstEmpleados.find(e => e.empId === empleado.id)?.empNombres + ' ' +
          this.lstEmpleados.find(e => e.empId === empleado.id)?.emplApellidos;
        //MES QUE MAS SE VENDE 
        this.lstMesesTop = this.obtenerTop3MesesConVentas(res.data);

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
        this.lstEmpleados = resp.data;
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
  Inventario de Compras 
  ********************************/
  ultimas5Compras() {

    this.loadUltimasCompras = true;

    this.comprasService.getData().subscribe(
      resp => {

        this.ultimasCompras = Object.keys(resp.data).map(a => ({

          comId: resp.data[a].comId,
          comNumOrden: resp.data[a].comNumOrden,
          comFecha: resp.data[a].comFecha,
          comProveedor: resp.data[a].comProveedor,
          comDescripcion: resp.data[a].comDescripcion,
          comTotal: resp.data[a].comTotal,
          detalles: resp.data[a].detalles

        } as Icompra))

        this.ultimasCompras = this.ultimasCompras.slice(0, 4)
        this.loadUltimasCompras = false;

      }
    )

  }



  /*******************************
  Obtener los 5 productos + vendidos
  ********************************/

  obtenerProductosMasVendidos(listaDeFacturas: any): any[] {

    this.lstRepuestosMayoRotacion=[];

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
          nombre: detalle.codigoPils, // Reemplaza con el nombre real del producto
          cantidadVendida: detalle.detCantidad,
          precio : detalle.detPrecio,
          nombreCorto:detalle.nombreCorto
        };
      }
      return productos;
    }, {});

    // Convierte el objeto de productos de nuevo en un array
    const productosVendidosArray = Object.values(productosVendidos);

    // Ordena el array por la cantidad vendida de manera descendente
    productosVendidosArray.sort((a: any, b: any) => b.cantidadVendida - a.cantidadVendida);
    this.lstRepuestosMayoRotacion = productosVendidosArray;

    // Obtiene los primeros 5 productos
    const primerosCincoProductos = productosVendidosArray.slice(0, 5);

    return primerosCincoProductos;
  }


  /*******************************
  Obtener el mejor cliente
  ********************************/
  obtenerClienteQueMasCompra(listaDeFacturas: any): any {
    // Agrupa las facturas por el id del cliente y suma los totales comprados
    const clientesCompradores = listaDeFacturas.reduce((clientes: any, factura: any) => {
      const idCliente = factura.facIdCliente;
      if (clientes[idCliente]) {
        clientes[idCliente].totalComprado += factura.facTotal;
      } else {
        clientes[idCliente] = {
          id: idCliente,
          nombre: factura.cliente, // Reemplaza con el nombre real del cliente
          totalComprado: factura.facTotal
        };
      }
      return clientes;
    }, {});

    // Convierte el objeto de clientes de nuevo en un array
    const clientesCompradoresArray = Object.values(clientesCompradores);

    // Ordena el array por el total comprado de manera descendente
    let salida = clientesCompradoresArray.sort((a: any, b: any) => b.totalComprado - a.totalComprado);
    salida = salida.splice(0,3);
    return salida;

  }

  obtenerEmpleadoQueMasVende(listaDeFacturas: any): any {
    // Agrupa las facturas por el id del empleado y suma los totales vendidos
    const empleadosVendedores = listaDeFacturas.reduce((empleados: any, factura: any) => {
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
    empleadosVendedoresArray.sort((a: any, b: any) => b.totalVendido - a.totalVendido);

    // Obtiene el empleado que más vende
    const empleadoQueMasVende = empleadosVendedoresArray.length > 0 ? empleadosVendedoresArray[0] : null;

    return empleadoQueMasVende;
  }


  obtenerTop3MesesConVentas(listaDeFacturas: any): any[] {
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
  
    // Ordena los meses por ventas de mayor a menor
    const mesesOrdenados = Object.keys(ventasPorMes).sort((mes1, mes2) =>
      ventasPorMes[mes2] - ventasPorMes[mes1]
    );
  
    // Toma los tres primeros meses
    const top3Meses = mesesOrdenados.slice(0, 3);
  
    // Crea una lista de objetos con el mes y las ventas
    const resultado = top3Meses.map((mes) => ({
      mes: mes,
      ventas: ventasPorMes[mes],
    }));
  
    return resultado;
  }




}
