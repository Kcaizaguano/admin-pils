import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Icotizacion } from 'src/app/interface/icotizacion';
import { Icliente } from 'src/app/interface/icliente';
import { Iempleados } from 'src/app/interface/iempleados';
import { CotizacionesService } from 'src/app/services/cotizaciones.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { VentasService } from 'src/app/services/ventas.service';
import { Router } from '@angular/router';
import { alerts } from 'src/app/helpers/alerts';

@Component({
  selector: 'app-cotizacion',
  templateUrl: './cotizacion.component.html',
  styleUrls: ['./cotizacion.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ]
})
export class CotizacionComponent implements OnInit {

  
  /*===========================================
  Variable global para nombrar columnas 
  ===========================================*/
  displayedColumns: string[] = ['id', 'fecha','cliente', 'total','acciones'];

  /*===========================================
  Variable global que instancie la Data que aparecera en la Tabla
  ===========================================*/

  dataSource!: MatTableDataSource<Icotizacion>;

  /*===========================================
Variable global para informar a la vista cuadno hay una expancion en la tabla
===========================================*/

  expandedElement!: Icotizacion | null;

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

  cotizaciones: Icotizacion[] = [];
  clientes: Icliente[] = [];
  empleados: Iempleados[] = [];



  constructor ( private cotizacionesService:CotizacionesService,
    private ventasService:VentasService,
    private clientesService:ClientesService,
    private empleadosService:EmpleadosService,
    private router:Router){}

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

    this.cargarListas();

    this.getData();
    
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
  Función para tomar la data de las cotizaciones
  ===========================================*/
  getData() {

    this.loadData= true;

    this.cotizacionesService.getData().subscribe(
      resp => {

        this.cotizaciones = Object.keys(resp.data).map(a => ({

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
            cliIdentificacion:this.clientes.find(c => c.cliId === resp.data[a].cotIdCliente )?.cliIdentificacion,

        } as Icotizacion))



        this.dataSource = new MatTableDataSource(this.cotizaciones);
        this.dataSource.paginator = this.paginator;
        this.loadData= false;
      }
    )
  }

  editar(elemento : any){
    this.router.navigate(['ventas/editar-venta/cotizacion',elemento.cotId])
  }

  cotizarNuevo(){
    this.router.navigate(['ventas/nueva-venta/cotizacion'])
  }

  deleteCotizacion(cotizacion : Icotizacion){

    alerts.confirmAlert("¿ Estás seguro de eliminar ?", "La información ya no se puede recuperar","warning","Si, eliminar").then(
      (result)=> {

        if (result.isConfirmed) {
          this.cotizacionesService.deleteData(cotizacion.cotId).subscribe(
            resp =>{
              if (resp.exito === 1) {
                alerts.basicAlert("Eliminado", resp.mensaje ,"success" );
                this.getData();
              }else{
                alerts.basicAlert("Error", resp.mensaje ,"error" );
              }
            }
          )
          
        }
      }
    )

  }

}
