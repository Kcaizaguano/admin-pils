import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { dialog, enviroment } from 'src/app/enviroments/enviroments';
import { functions } from 'src/app/helpers/functions';
import { alerts } from 'src/app/helpers/alerts';
import { Iproveedor } from 'src/app/interface/iproveedor';
import { ProveedoresService } from 'src/app/services/proveedores.service';
import { DialogProveedorComponent } from './dialog-proveedor/dialog-proveedor.component';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ]
})
export class ProveedoresComponent  implements OnInit {
  
  /*===========================================
  Variable global para nombrar columnas 
  ===========================================*/
  displayedColumns: string[] = ['id', 'proveedor', 'acciones'];

  /*===========================================
  Variable global que instancie la Data que aparecera en la Tabla
  ===========================================*/

  dataSource!: MatTableDataSource<Iproveedor>;

  /*===========================================
Variable global para informar a la vista cuadno hay una expancion en la tabla
===========================================*/

  expandedElement!: Iproveedor | null;

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

  proveedores: Iproveedor[] = [];

  constructor( private proveedoresService:ProveedoresService,
    public dialog:MatDialog) { }



    ngOnInit(): void {
      
      /*==================
      Cargar datos al iniciar 
      ======================*/
      
      this.getData();
      
      
      /*===========================================
      Definir el tamaño de pantalla
      ===========================================*/
          if (functions.dimencionPantalla(0, 767)) {
            this.pantallaCorta = true;
          } else {
            this.pantallaCorta = false;
            this.displayedColumns.splice(2, 0, 'telefono')
      
      
          }
      
        }


  /*===========================================
  Función para tomar la data de los proveedores
  ===========================================*/
  getData() {

    this.loadData= true;


    this.proveedoresService.getData().subscribe(
      resp => {
        this.proveedores = resp.data;

        this.dataSource = new MatTableDataSource(this.proveedores);
        this.dataSource.paginator = this.paginator;
        this.loadData= false;
      }
    )
  }

  newProveedor(){

    const  dialogRef = this.dialog.open(DialogProveedorComponent , {width: dialog.tamaño });

    /*===========================================
    Actualizar listado de la tabla
    ===========================================*/
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getData();
      }
    } )

  }

  editProveedor( proveedor : Iproveedor){

    const  dialogRef = this.dialog.open(DialogProveedorComponent , 
      {
        width:dialog.tamaño,
        data:proveedor

      });

    /*===========================================
    Actualizar listado de la tabla
    ===========================================*/
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getData();
      }
    } );

  }

  deleteProveedor(proveedor : Iproveedor){

    alerts.confirmAlert("¿ Estás seguro de eliminar ?", "La información ya no se puede recuperar","warning","Si, eliminar").then(
      (result)=> {

        if (result.isConfirmed) {
          this.proveedoresService.deleteData(proveedor.proId).subscribe(
            resp =>{
              if (resp.exito === 1) {
                alerts.basicAlert("Eliminado", resp.mensaje ,"success" );
                this.getData();
              }else{
                alerts.basicAlert("Error de servidor", resp.mensaje ,"error" );

              }
            }
          )
          
        }
      }
    )

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


}
