import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { dialog } from 'src/app/enviroments/enviroments';
import { functions } from 'src/app/helpers/functions';
import { alerts } from 'src/app/helpers/alerts';
import { Icliente } from 'src/app/interface/icliente';
import { ClientesService } from 'src/app/services/clientes.service';
import { CiudadesService } from 'src/app/services/ciudades.service';
import { DialogClienteComponent } from './dialog-cliente/dialog-cliente.component';
import { Iciudad } from 'src/app/interface/iciudad';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ]
})
export class ClientesComponent implements OnInit {

  constructor( private clientesService:ClientesService,
              private ciudadesService:CiudadesService,
              public dialog:MatDialog) { }

  /*===========================================
  Variable global para nombrar columnas 
  ===========================================*/
  displayedColumns: string[] = ['id', 'cliente', 'acciones'];

  /*===========================================
  Variable global que instancie la Data que aparecera en la Tabla
  ===========================================*/

  dataSource!: MatTableDataSource<Icliente>;

  /*===========================================
Variable global para informar a la vista cuadno hay una expancion en la tabla
===========================================*/

  expandedElement!: Icliente | null;

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

  clientes: Icliente[] = [];
  ciudades:Iciudad[]=[];



  ngOnInit(): void {


/*==================
Cargar Ciudades
======================*/
this.ciudadesService.getData().subscribe(
  resp => {
    this.ciudades = resp.data;
  }
)

setTimeout(() => {
  /*==================
Cargar datos al iniciar 
======================*/
  this.getData();
}, 500);






/*===========================================
Definir el tamaño de pantalla
===========================================*/
    if (functions.dimencionPantalla(0, 767)) {
      this.pantallaCorta = true;
    } else {
      this.pantallaCorta = false;
      this.displayedColumns.splice(2, 0, 'identificacion')


    }

  }


  /*===========================================
  Función para tomar la data de los usuarios
  ===========================================*/
  getData() {

    this.loadData= true;


    this.clientesService.getData().subscribe(
      resp => {
        this.clientes = Object.keys(resp.data).map(a => ({

        cliId: resp.data[a].cliId,
        cliNombres: resp.data[a].cliNombres,
        cliApellidos: resp.data[a].cliApellidos,
        cliDireccion: resp.data[a].cliDireccion,
        cliTelefono: resp.data[a].cliTelefono,
        cliEmail: resp.data[a].cliEmail,
        cliTipoIdentificacion:resp.data[a].cliTipoIdentificacion,
        cliIdentificacion:resp.data[a].cliIdentificacion,
        cliIdCiudad:resp.data[a].cliIdCiudad,
        ciudad:this.ciudades.find(c => c.ciuId === resp.data[a].cliIdCiudad )?.ciuNombre
        } as Icliente))



        this.dataSource = new MatTableDataSource(this.clientes);
        this.dataSource.paginator = this.paginator;
        this.loadData= false;
      }
    )
  }



  newCliente(){

    const  dialogRef = this.dialog.open(DialogClienteComponent , {width: dialog.tamaño });

    /*===========================================
    Actualizar listado de la tabla
    ===========================================*/
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getData();
      }
    } )

  }




  editCliente( cliente : Icliente){

    const  dialogRef = this.dialog.open(DialogClienteComponent , 
      {
        width:dialog.tamaño,
        data:cliente

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

  deleteCliente(cliente : Icliente){

    alerts.confirmAlert("¿ Estás seguro de eliminar ?", "La información ya no se puede recuperar","warning","Si, eliminar").then(
      (result)=> {

        if (result.isConfirmed) {
          this.clientesService.deleteData(cliente.cliId).subscribe(
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
