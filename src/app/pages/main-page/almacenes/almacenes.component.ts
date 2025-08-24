import {LiveAnnouncer} from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { dialog } from 'src/app/enviroments/enviroments';
import { Ialmacen } from 'src/app/interface/ialmacen';
import { AlmacenesService } from 'src/app/services/almacenes.service';
import { DialogAlmacenComponent } from './dialog-almacen/dialog-almacen.component';
import { alerts } from 'src/app/helpers/alerts';
import { functions } from 'src/app/helpers/functions';

@Component({
  selector: 'app-almacenes',
  templateUrl: './almacenes.component.html',
  styleUrls: ['./almacenes.component.css']
})
export class AlmacenesComponent implements OnInit {



  /*===========================================
  Variable global para nombrar columnas 
  ===========================================*/
  displayedColumns: string[] = ['id', 'almacen', 'descripcion', 'acciones'];

  /*===========================================
  Variable global que instancie la Data que aparecera en la Tabla
  ===========================================*/

  dataSource!: MatTableDataSource<Ialmacen>;

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

  almacenes: Ialmacen[] = [];

  constructor(private almacenesService: AlmacenesService,
              public dialog:MatDialog,
              private _liveAnnouncer: LiveAnnouncer) { }


  /*==================
  Cargar datos al iniciar 
  ======================*/
  ngOnInit(): void {

    this.getData();
  }



  /*===========================================
  Función para tomar la data de los usuarios
  ===========================================*/
  async  getData() {

    this.loadData= true;
    this.almacenes = await functions.verificacionAlmacenes(this.almacenesService);
        this.dataSource = new MatTableDataSource(this.almacenes);
        this.dataSource.paginator = this.paginator;
        this.loadData= false;
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

    newAlmacen(){

      const  dialogRef = this.dialog.open(DialogAlmacenComponent , {width: dialog.tamaño });
  
      /*===========================================
      Actualizar listado de la tabla
      ===========================================*/
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.getData();
        }
      } )
  
    }


    editAlmacen( almacen : Ialmacen){

      const  dialogRef = this.dialog.open(DialogAlmacenComponent , 
        {
          width:dialog.tamaño,
          data:almacen
  
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

    deleteAlmacen( almacen: Ialmacen){

    
      alerts.confirmAlert("¿ Estás seguro de eliminar ?", "La información ya no se puede recuperar","warning","Si, eliminar").then(
        (result)=> {
  
          if (result.isConfirmed) {
            this.almacenesService.deleteData(almacen.almId).subscribe(
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

}
