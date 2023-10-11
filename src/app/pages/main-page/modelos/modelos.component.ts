import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { dialog, enviroment } from 'src/app/enviroments/enviroments';
import { functions } from 'src/app/helpers/functions';
import { alerts } from 'src/app/helpers/alerts';
import { Imodelo } from 'src/app/interface/imodelo';
import { ModelosService } from 'src/app/services/modelos.service';
import { DialogModeloComponent } from './dialog-modelo/dialog-modelo.component';

@Component({
  selector: 'app-modelos',
  templateUrl: './modelos.component.html',
  styleUrls: ['./modelos.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ]
})
export class ModelosComponent implements OnInit{



  /*===========================================
  Variable global para nombrar columnas 
  ===========================================*/
  displayedColumns: string[] = ['id', 'modelo', 'descripcion', 'acciones'];

  /*===========================================
  Variable global que instancie la Data que aparecera en la Tabla
  ===========================================*/

  dataSource!: MatTableDataSource<Imodelo>;

  /*===========================================
  Paginacion y Orden
  ===========================================*/

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  /*===========================================
  Variable global para saber cuando fianliza la carga de los datos
  ===========================================*/
  loadData = false;

  /*===========================================
  Variables globales de la interfaz de usuario
  ===========================================*/

  modelos: Imodelo[] = [];

  constructor(private modelosService: ModelosService,
    public dialog:MatDialog) { }


  /*==================
  Cargar datos al iniciar 
  ======================*/
  ngOnInit(): void {

    this.getData();
  }

  /*===========================================
  Función para tomar la data de los usuarios
  ===========================================*/
  getData() {

    this.loadData= true;


    this.modelosService.getData().subscribe(
      resp => {

        this.modelos = resp.data;

        this.dataSource = new MatTableDataSource(this.modelos);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loadData= false;
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

    newModelo(){

      const  dialogRef = this.dialog.open(DialogModeloComponent , {width: dialog.tamaño });
  
      /*===========================================
      Actualizar listado de la tabla
      ===========================================*/
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.getData();
        }
      } )
  
    }

    editMarca( modelo : Imodelo){

      const  dialogRef = this.dialog.open(DialogModeloComponent , 
        {
          width:dialog.tamaño,
          data:modelo
  
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

    deleteMarca( modelo: Imodelo){

    
      alerts.confirmAlert("¿ Estás seguro de eliminar ?", "La información ya no se puede recuperar","warning","Si, eliminar").then(
        (result)=> {
  
          if (result.isConfirmed) {
            this.modelosService.deleteData(modelo.modId).subscribe(
              resp =>{
                if (resp.exito === 1) {
                  alerts.basicAlert("Eliminado", resp.mensaje ,"success" );
                  this.getData();
                }else{
                  alerts.basicAlert("Error de servidor", 'La marca ya se está siendo utilizada, para eliminar consulte con el administrador' ,"error" );
                }
              }
            )
            
          }
        }
      )
  
    }

}
