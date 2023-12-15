import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { IAuditoriaRepuestoTransaccion } from 'src/app/interface/i-auditoria-repuesto-transaccion';
import { AudiTransaccionesRepService } from 'src/app/services/audi-transacciones-rep.service';

@Component({
  selector: 'app-auditoria-repuestos',
  templateUrl: './auditoria-repuestos.component.html',
  styleUrls: ['./auditoria-repuestos.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ]
})
export class AuditoriaRepuestosComponent implements OnInit {



  /*===========================================
  Variable global para nombrar columnas 
  ===========================================*/
  displayedColumns: string[] = ['fecha', 'repuesto' ,'origen', 'destino', 'cantidad','usuario'];

  /*===========================================
  Variable global que instancie la Data que aparecera en la Tabla
  ===========================================*/

  dataSource!: MatTableDataSource<IAuditoriaRepuestoTransaccion>;

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

  auditorias: IAuditoriaRepuestoTransaccion[] = [];


  constructor(
    private AudiTransaccionesRepService: AudiTransaccionesRepService) { }


  ngOnInit(): void {
    this.getData();

  }

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


  /*===========================================
  Función para tomar la data de las auditorias
  ===========================================*/
  getData() {

    this.loadData= true;

    this.AudiTransaccionesRepService.getData().subscribe(
      resp => {

        this.auditorias = resp.data;
        this.dataSource = new MatTableDataSource(this.auditorias);
        this.dataSource.paginator = this.paginator;
        this.loadData= false;
      }
    )
  }

}
