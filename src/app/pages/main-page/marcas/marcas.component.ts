import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { dialog, enviroment } from 'src/app/enviroments/enviroments';
import { functions } from 'src/app/helpers/functions';
import { alerts } from 'src/app/helpers/alerts';
import { CiudadesService } from 'src/app/services/ciudades.service';
import { Imarca } from 'src/app/interface/imarca';
import { MarcasService } from 'src/app/services/marcas.service';
import { DialogMarcaComponent } from './dialog-marca/dialog-marca.component';

@Component({
  selector: 'app-marcas',
  templateUrl: './marcas.component.html',
  styleUrls: ['./marcas.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ]
})
export class MarcasComponent implements OnInit {



  /*===========================================
  Variable global para nombrar columnas 
  ===========================================*/
  displayedColumns: string[] = ['id', 'marca', 'descripcion', 'acciones'];

  /*===========================================
  Variable global que instancie la Data que aparecera en la Tabla
  ===========================================*/

  dataSource!: MatTableDataSource<Imarca>;

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

  marcas: Imarca[] = [];

  constructor(private marcasService: MarcasService,
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


    this.marcasService.getData().subscribe(
      resp => {

        this.marcas = resp.data;

        this.dataSource = new MatTableDataSource(this.marcas);
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

  newMarca(){

    const  dialogRef = this.dialog.open(DialogMarcaComponent , {width: dialog.tamaño });

    /*===========================================
    Actualizar listado de la tabla
    ===========================================*/
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getData();
      }
    } )

  }

  editMarca( marca : Imarca){

    const  dialogRef = this.dialog.open(DialogMarcaComponent , 
      {
        width:dialog.tamaño,
        data:marca

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

  deleteMarca( marca: Imarca){

    
    alerts.confirmAlert("¿ Estás seguro de eliminar ?", "La información ya no se puede recuperar","warning","Si, eliminar").then(
      (result)=> {

        if (result.isConfirmed) {
          this.marcasService.deleteData(marca.marId).subscribe(
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
