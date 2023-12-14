import { Component, OnInit ,ViewChild } from '@angular/core';
import { UsersService } from 'src/app/services/users.service';
import {MatPaginator} from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { IUsersLogin } from 'src/app/interface/i-users-login';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { Iempleados } from 'src/app/interface/iempleados';
import { dialog, enviroment } from 'src/app/enviroments/enviroments';
import { functions } from 'src/app/helpers/functions';
import { Ialmacen } from 'src/app/interface/ialmacen';
import { AlmacenesService } from 'src/app/services/almacenes.service';
import { DialogUsuarioComponent } from './dialog-usuario/dialog-usuario.component';
import { alerts } from 'src/app/helpers/alerts';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0'})),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ]
})
export class UsuariosComponent implements OnInit {


  constructor(private usersService: UsersService,
    private empleadosService: EmpleadosService,
    private almacenesService:AlmacenesService,
    public dialog:MatDialog) { }


  /*===========================================
  Variable global para nombrar coolumnas 
  ===========================================*/
  displayedColumns: string[] = ['id', 'empleado', 'acciones'];

  /*===========================================
  Variable global que instancie la Data que aparecera en la Tabla
  ===========================================*/

  dataSource!: MatTableDataSource<Iempleados>;


  /*===========================================
  Variables globales de la interfaz de usuario
  ===========================================*/
  usuarios: IUsersLogin[] = [];
  empleados: Iempleados[] = [];
  almacenes:Ialmacen[] = [];


  /*===========================================
  Variable global para informar a la vista cuadno hay una expancion en la tabla
  ===========================================*/
  expandedElement!: Iempleados | null;

  /*===========================================
 Variable global de ruta de los archivos de imagen
  ===========================================*/
  //path = enviroment.urlImagen;

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
  loadData= false;

  ngOnInit(): void {

    this.getData();

        /*===========================================
    Definir el tamaño de pantalla
    ===========================================*/
    if (functions.dimencionPantalla(0, 767)) {
      this.pantallaCorta = true;
    } else {
      this.pantallaCorta = false;
      this.displayedColumns.splice(2,0,'cargo')
      this.displayedColumns.splice(3,0,'acceso')

    }
  }

  /*===========================================
  Función para tomar la data de los usuarios
  ===========================================*/
  getData() {

    this.loadData= true;


    this.usersService.getData().subscribe(
      (resp) => {
        this.usuarios = resp.data;
      }
    )

    this.almacenesService.getData().subscribe(
      resp => {
        this.almacenes = resp.data;
      }
    )



    this.empleadosService.getData().subscribe(
      resp => {
        this.empleados = Object.keys(resp.data).map(a => ({

          empId: resp.data[a].empId,
          empNombres: resp.data[a].empNombres,
          empCedula: resp.data[a].empCedula,
          emplApellidos: resp.data[a].emplApellidos,
          empDireccion: resp.data[a].empDireccion,
          empTelefono: resp.data[a].empTelefono,
          empEmail: resp.data[a].empEmail,
          empGenero: resp.data[a].empGenero,
          empEstadoCivil: resp.data[a].empEstadoCivil,
          empIdAlmacen: resp.data[a].empIdAlmacen,
          empUrlImagen: resp.data[a].empUrlImagen,
          empActivo: resp.data[a].empActivo,
          usuario: this.usuarios.find(u => u.logIdEmpleado === resp.data[a].empId),
          almacen:this.almacenes.find(l => l.almId === resp.data[a].empIdAlmacen )?.almNombre,
          cargo: this.usuarios.find(u => u.logIdEmpleado === resp.data[a].empId)?.logCargo


        } as Iempleados))


        this.dataSource = new MatTableDataSource(this.empleados);
        this.dataSource.paginator = this.paginator;
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

  /*===========================================
  Función crear un  nuevo usuario o Empleado
  ===========================================*/
  newUsuario(){
    const  dialogRef = this.dialog.open(DialogUsuarioComponent , {width:dialog.tamaño});

      /*===========================================
      Actualizar listado de la tabla
      ===========================================*/
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.getData();
        }
      } )

  }

  editUsuario( empleado: Iempleados){

    const  dialogRef = this.dialog.open(DialogUsuarioComponent , 
      {
        width:dialog.tamaño,
        data:empleado

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

  deleteUsuario(empleado: Iempleados){

    alerts.confirmAlert("¿ Estás seguro de eliminar ?", "La información ya no se puede recuperar","warning","Si, eliminar").then(
      (result)=> {

        if (result.isConfirmed) {
          this.empleadosService.deleteData(empleado.empId).subscribe(
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
