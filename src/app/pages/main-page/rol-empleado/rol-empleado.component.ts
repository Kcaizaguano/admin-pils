import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Icotizacion } from 'src/app/interface/icotizacion';
import { IfiltroCotizacion } from 'src/app/interface/ifiltroCotizacion';
import { IfiltroFactura } from 'src/app/interface/ifiltroFactura';
import { Iventa } from 'src/app/interface/iventa';
import { CotizacionesService } from 'src/app/services/cotizaciones.service';
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

  /*========================================================
variables globales para definir el inventario de cotizaciones
==========================================================*/
  cotizaciones = 0;
  loadCotizaciones = false;
  cotizacionesRecientes: any = [];

  /*===========================================
  Variable para usuario conectado
  ===========================================*/
  usuarioConectado = 0;

  constructor(private ventasService: VentasService,
    private router: Router,
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
        //SABER EL USUARIO CONENTADO
    const usuario = JSON.parse(localStorage.getItem('usuario')!);
    this.usuarioConectado = usuario.id;
      this.getFilterDataCotizacion();
      this.getData();



  }

  /*===========================================
  Función para tomar la data de los usuarios
  ===========================================*/
  getData() {

    this.loadData = true;

    var filtro : IfiltroFactura = {
      estado : 1,
      idEmpleado : this.usuarioConectado,
    }

    this.ventasService.getFilter(filtro).subscribe(
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
          cliIdentificacion: resp.data[a].clienteIdentificacion,
          cliApellidos:resp.data[a].clienteApellido,
          cliNombres:resp.data[a].clienteNombre,
        } as Iventa))
        this.dataSource = new MatTableDataSource(this.ventas);
        this.dataSource.paginator = this.paginator;
        this.loadData = false;
      }
    )

  }

  verVenta(id: any) {
    window.open('ventas/ver-venta/venta/' + id);
  }


  editar(elemento: any) {

    this.router.navigate(['ventas/editar-factura', elemento.facId])
  }



  /*===========================================
  Función para tomar la data filtrada
  ===========================================*/
  getFilterDataCotizacion(){
    
    var data : IfiltroCotizacion =
    {
      numeroElementos : 5
      
    }
    this.cotizacionesService.getFilter(data).subscribe(
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
            cliIdentificacion:resp.data[a].clienteIdentificacion,
            cliNombres:resp.data[a].clienteNombre + " " + resp.data[a].clienteApellido,
        } as Icotizacion))
        this.dataSource = new MatTableDataSource(this.cotizacionesRecientes);
        this.dataSource.paginator = this.paginator;
        this.loadData= false;
      }
    )
  }




  editarCotizacion(elemento: any) {
    this.router.navigate(['ventas/editar-venta/cotizacion', elemento.cotId])
  }

  nuevaVenta() {

    this.router.navigate(['ventas/nueva-venta/venta'])
  }



}

