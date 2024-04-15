import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Icliente } from 'src/app/interface/icliente';
import { Icotizacion } from 'src/app/interface/icotizacion';
import { Iempleados } from 'src/app/interface/iempleados';
import { Iventa } from 'src/app/interface/iventa';
import { ClientesService } from 'src/app/services/clientes.service';
import { CotizacionesService } from 'src/app/services/cotizaciones.service';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { VentasService } from 'src/app/services/ventas.service';

@Component({
  selector: 'app-rol-empleado',
  templateUrl: './rol-empleado.component.html',
  styleUrls: ['./rol-empleado.component.css']
})
export class RolEmpleadoComponent implements OnInit {


  /*===========================================
  Variable global para nombrar columnas 
  ===========================================*/
  displayedColumns: string[] = ['id', 'fecha', 'cliente', 'apellidos', 'total', 'acciones'];

  /*===========================================
  Variable global que instancie la Data que aparecera en la Tabla
  ===========================================*/

  dataSource!: MatTableDataSource<Iventa>;

  /*===========================================
Variable global para informar a la vista cuadno hay una expancion en la tabla
===========================================*/

  expandedElement!: Iventa | null;

  /*===========================================
Variable global para saber el tamaño de pantalla
===========================================*/

  pantallaCorta = false;

  /*===========================================
  Paginacion y Orden
  ===========================================*/

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  /*===========================================
Variable global para saber cuando fianliza la carga de los datos
===========================================*/
  loadData = false;

  /*===========================================
  Variables globales de la interfaz de usuario
  ===========================================*/

  ventas: Iventa[] = [];
  clientes: Icliente[] = [];
  empleados: Iempleados[] = [];

  /*========================================================
variables globales para definir el inventario de cotizaciones
==========================================================*/
  cotizaciones = 0;
  loadCotizaciones = false;
  cotizacionesRecientes: any = [];
  lstClientes!: Icliente[];

  /*===========================================
  Variable para usuario conectado
  ===========================================*/
  usuarioConectado = 0;

  constructor(private ventasService: VentasService,
    private clientesService: ClientesService,
    private router: Router,
    private empleadosService: EmpleadosService,
    private cotizacionesService: CotizacionesService
  ) { }


  /*===========================================
  Función para filtro de busqueda
  ===========================================*/

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

  }

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarListas();

    setTimeout(() => {
      this.getData();
    this.cargarCotizaciones();


    }, 1500);

    //SABER EL USUARIO CONENTADO
    const usuario = JSON.parse(localStorage.getItem('usuario')!);
    this.usuarioConectado = usuario.id;

  }


  cargarListas() {

    this.clientesService.getData().subscribe(
      resp => {
        this.clientes = resp.data;
      }
    )

    this.empleadosService.getData().subscribe(
      resp => {
        this.empleados = resp.data;
      }
    )

  }



  /*===========================================
  Función para tomar la data de los usuarios
  ===========================================*/
  getData() {

    this.loadData = true;

    this.ventasService.getData().subscribe(
      resp => {

        this.ventas = Object.keys(resp.data).map(a => ({
          facId: resp.data[a].facId,
          facFecha: resp.data[a].facFecha,
          facSubtotal: resp.data[a].facSubtotal,
          facDescuento: resp.data[a].facDescuento,
          facIva: resp.data[a].facIva,
          facValorIva: resp.data[a].facValorIva,
          facTotal: resp.data[a].facTotal,
          facEstado: resp.data[a].facEstado,
          facIdEmpleado: resp.data[a].facIdEmpleado,
          facIdCliente: resp.data[a].facIdCliente,
          facIdMetPago: resp.data[a].facIdMetPago,
          detalles: resp.data[a].detalles,
          cliIdentificacion: this.clientes.find(c => c.cliId === resp.data[a].facIdCliente)?.cliIdentificacion,
          cliApellidos: this.clientes.find(n => n.cliId === resp.data[a].facIdCliente)?.cliApellidos

        } as Iventa))


        this.ventas = this.ventas.filter(v => v.facEstado == 1 && v.facIdEmpleado == this.usuarioConectado);
        this.dataSource = new MatTableDataSource(this.ventas);
        this.dataSource.paginator = this.paginator;
        this.loadData = false;
      }
    )
  }

  verVenta(id: any) {
    window.open('ver-venta/' + id);
  }


  editar(elemento: any) {

    this.router.navigate(['ventas/editar-factura', elemento.facId])
  }

  /*******************************
  Inventario de Clientes 
  ********************************/
  cargarClientes() {
    this.clientesService.getData().subscribe(
      resp => {
        this.lstClientes = resp.data;
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


          cotId: resp.data[a].cotId,
          cotFecha: resp.data[a].cotFecha,
          cotSubtotal: resp.data[a].cotSubtotal,
          cotDescuento: resp.data[a].cotDescuento,
          cotIva: resp.data[a].cotIva,
          cotValorIva: resp.data[a].cotValorIva,
          cotTotal: resp.data[a].cotTotal,
          cotEstado: resp.data[a].cotEstado,
          cotIdEmpleado: resp.data[a].cotIdEmpleado,
          cotIdCliente: resp.data[a].cotIdCliente,
          cotIdMetPago: resp.data[a].cotIdMetPago,
          detalles: resp.data[a].detalles,
          cliNombres: this.nombreCLiente(resp.data[a].cotIdCliente)
          // cliNombres:this.lstClientes.find(n => n.cliId === resp.data[a].cotIdCliente )?.cliApellidos + ' '+
          //             this.lstClientes.find(n => n.cliId === resp.data[a].cotIdCliente )?.cliNombres 

        } as Icotizacion))

        this.cotizacionesRecientes = this.cotizacionesRecientes.slice(0, 5)

        this.loadCotizaciones = false;
      }
    )
  }


  editarCotizacion(elemento: any) {
    this.router.navigate(['ventas/editar-venta/cotizacion', elemento.cotId])
  }

  nuevaVenta() {

    this.router.navigate(['ventas/nueva-venta/venta'])
  }

  nombreCLiente(cotIdCliente: any) {

    var cliente = this.lstClientes.find((n: any) => n.cliId == cotIdCliente);

    return cliente?.cliApellidos + ' ' + cliente?.cliNombres;

  }


}

