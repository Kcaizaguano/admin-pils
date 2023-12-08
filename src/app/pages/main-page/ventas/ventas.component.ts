import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { VentasService } from 'src/app/services/ventas.service';
import { Iventa } from 'src/app/interface/iventa';
import { Icliente } from 'src/app/interface/icliente';
import { ClientesService } from 'src/app/services/clientes.service';
import { Iempleados } from 'src/app/interface/iempleados';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ]
})
export class VentasComponent implements OnInit {


  /*===========================================
  Variable global para nombrar columnas 
  ===========================================*/
  displayedColumns: string[] = ['id', 'fecha','cliente', 'total','acciones'];

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



  constructor ( private ventasService:VentasService,
                private clientesService:ClientesService,
                private router:Router,
                private empleadosService:EmpleadosService){}


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
  Función para tomar la data de los usuarios
  ===========================================*/
  getData() {

    this.loadData= true;

    this.ventasService.getData().subscribe(
      resp => {

        this.ventas = Object.keys(resp.data).map(a => ({

            facId:   resp.data[a].facId,
            facFecha:  resp.data[a].facFecha,
            facSubtotal: resp.data[a].facSubtotal,
            facDescuento: resp.data[a].facDescuento,
            facIva: resp.data[a].facIva,
            facValorIva:  resp.data[a].facValorIva,
            facTotal: resp.data[a].facTotal,
            facEstado: resp.data[a].facEstado,
            facIdEmpleado:  resp.data[a].facIdEmpleado,
            facIdCliente:  resp.data[a].facIdCliente,
            facIdMetPago:  resp.data[a].facIdMetPago,
            detalles:  resp.data[a].detalles,
            cliIdentificacion:this.clientes.find(c => c.cliId === resp.data[a].facIdCliente )?.cliIdentificacion,

        } as Iventa))



        this.dataSource = new MatTableDataSource(this.ventas);
        this.dataSource.paginator = this.paginator;
        this.loadData= false;
      }
    )
  }

verVenta(id : any){
  window.open('ver-venta/'+ id);
}


editar(elemento : any){

  this.router.navigate(['ventas/editar-venta/venta',elemento.facId])
}

}
