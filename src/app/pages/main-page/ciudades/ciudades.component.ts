import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Iciudad } from 'src/app/interface/iciudad';
import { CiudadesService } from 'src/app/services/ciudades.service';
import { functions } from 'src/app/helpers/functions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { alerts } from 'src/app/helpers/alerts';

@Component({
  selector: 'app-ciudades',
  templateUrl: './ciudades.component.html',
  styleUrls: ['./ciudades.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ]
})
export class CiudadesComponent implements OnInit {

  /*===========================================
  Variable global para nombrar columnas 
  ===========================================*/
  displayedColumns: string[] = ['id', 'ciudad', 'acciones'];

  /*===========================================
  Variable global que instancie la Data que aparecera en la Tabla
  ===========================================*/

  dataSource!: MatTableDataSource<Iciudad>;

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

  marcas: Iciudad[] = [];



  /*===========================================
  Variable que valida el envío del formulario
  ===========================================*/

  formSubmitted = false;

  /*===========================================
  Variable para saber si es nuevo o se edita
  ===========================================*/

  editar = false;

  /*===========================================
  Variable para saber el id de la ciudad
  ===========================================*/

  ciudadId = 0;


  constructor(private ciudadesService: CiudadesService,
    private form: FormBuilder,) { }

  /*==================
Cargar datos al iniciar 
======================*/
  ngOnInit(): void {

    this.getData();
  }

  /*===========================================
  Función para tomar la data de las ciudades
  ===========================================*/
  getData() {

    this.loadData = true;


    this.ciudadesService.getData().subscribe(
      resp => {

        this.marcas = resp.data;

        this.dataSource = new MatTableDataSource(this.marcas);
        this.dataSource.paginator = this.paginator;
        this.loadData = false;
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

  guardar() {

    /*===========================================
    Validando que el formulario si se lo envio 
    ===========================================*/
    this.formSubmitted = true;

    if (this.f.invalid) {
      return;
    }


    /*===========================================
    Capturar la información del formulario en la Interfaz
    =========================================*/

    const dataCiudad: Iciudad = {

      ciuId: this.ciudadId,
      ciuNombre: this.f.controls['ciudad'].value.toUpperCase(),
    }


    if (!this.editar) {
      this.ciudadesService.postData(dataCiudad).subscribe(
        resp => {
          if (resp.exito === 1) {
            alerts.basicAlert('Ok', resp.mensaje, 'success');
          } else {
            alerts.basicAlert('Error Servidor', resp.mensaje, 'error');
          }
        }
      )

    } else {

      this.ciudadesService.putData(dataCiudad).subscribe(
        resp => {
          if (resp.exito === 1) {
            alerts.basicAlert('Ok', resp.mensaje, 'success');
          } else {
            alerts.basicAlert('Error Servidor', resp.mensaje, 'error');
          }

        }
      )

      this.editar = false;
    }

    this.f.controls['ciudad'].setValue(' ');
    setTimeout(() => {
      this.getData();
    }, 1500);



  }

  editCiudad(ciudad: Iciudad) {

    this.editar = true;
    this.f.controls['ciudad'].setValue(ciudad.ciuNombre);
    this.ciudadId = ciudad.ciuId;

  }

  deleteCiudad(ciudad: Iciudad) {

        
    alerts.confirmAlert("¿ Estás seguro de eliminar ?", "La información ya no se puede recuperar","warning","Si, eliminar").then(
      (result)=> {

        if (result.isConfirmed) {
          this.ciudadesService.deleteData(ciudad.ciuId).subscribe(
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


  // TODO LO NUEVO PARALA EDICION E INGRESO DE FOMULARIO
  /*=================
  Grupo de Controles
  ===================*/


  public f: FormGroup = this.form.group({
    ciudad: ['', [Validators.required, Validators.pattern('[a-z0-9A-ZáéíóúñÁÉÍÓÚÑ,.-/() ]*')]]
  })

  get ciudad() { return this.f.get('ciudad') }

  /*=========================
Validacion formulario
==============================*/

  invalidField(field: string) {
    return functions.invalidField(field, this.f, this.formSubmitted)
  }

}
