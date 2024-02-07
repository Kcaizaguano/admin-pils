import { Component, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DevolucionesService } from 'src/app/services/devoluciones.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Idevolucion } from 'src/app/interface/idevolucion';
import { MatPaginator } from '@angular/material/paginator';
import { functions } from 'src/app/helpers/functions';
import { DialogDevolucionComponent } from './dialog-devolucion/dialog-devolucion.component';
import { dialog } from 'src/app/enviroments/enviroments';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { alerts } from 'src/app/helpers/alerts';
import { ProductosService } from 'src/app/services/productos.service';


@Component({
  selector: 'app-devoluciones',
  templateUrl: './devoluciones.component.html',
  styleUrls: ['./devoluciones.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ]
})
export class DevolucionesComponent implements OnInit {


    /*=================
Grupo de Controles
===================*/

public f: FormGroup = this.form.group({
  idFactura: ['', { validators: Validators.required, }],
  cantidad: ['', { validators: Validators.required, }],
  producto: ['', { validators: Validators.required, }],
  costo: ['', { validators: Validators.required, }],
  motivo: [''],
  precio: [''],

})


  /*==========================
  Validación personalizada
  ================================*/

  get idFactura() { return this.f.get('idFactura') }
  get cantidad() { return this.f.get('cantidad') }
  get producto() { return this.f.get('producto') }
  get costo() { return this.f.get('costo') }
  get motivo() { return this.f.get('motivo') }
  get precio() { return this.f.get('precio') }


  constructor(private devolucionesService: DevolucionesService,
    public dialog: MatDialog,
    private form: FormBuilder,
    private productosService:ProductosService
    ) { }



  /*===========================================
  Variable global para nombrar columnas 
  ===========================================*/
  displayedColumns: string[] = ['id', 'venta', 'acciones'];

  /*===========================================
  Variable global que instancie la Data que aparecera en la Tabla
  ===========================================*/

  dataSource!: MatTableDataSource<Idevolucion>;

  /*===========================================
Variable global para informar a la vista cuadno hay una expancion en la tabla
===========================================*/

  expandedElement!: Idevolucion | null;

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

  devoluciones: Idevolucion[] = [];
  ciudades: Idevolucion[] = [];
  /*===========================================
  Variable que valida el envío del formulario
    ===========================================*/

    formSubmitted = false;
    idDetalle = 0;
    idProducto=0;
    cantidadAnterior = 0;
    id=0;
    editar=false;

  ngOnInit() {

    this.getData();

    this.precio?.disable();
    this.idFactura?.disable();
    this.producto?.disable();

    /*===========================================
Definir el tamaño de pantalla
===========================================*/
    if (functions.dimencionPantalla(0, 767)) {
      this.pantallaCorta = true;
    } else {
      this.pantallaCorta = false;
      this.displayedColumns.splice(2, 0, 'repuesto')
      this.displayedColumns.splice(3, 0, 'cantidad')
      this.displayedColumns.splice(4, 0, 'fecha')

    }

  }


  /*===========================================
  Función para tomar la data de los usuarios
  ===========================================*/
  getData() {

    this.loadData= true;


    this.devolucionesService.getData().subscribe(
      resp => {

        this.devoluciones = Object.keys(resp.data).map(a => ({
        devId :  resp.data[a].devId,
        devIdFac :  resp.data[a].devIdFac,
        devIdDetalle : resp.data[a].devIdDetalle,
        devCantidad :   resp.data[a].devCantidad,
        devFecha :  resp.data[a].devFecha, 
        devIdProducto :  resp.data[a].devIdProducto,
        devMotivo :  resp.data[a].devMotivo,
        devCosto  :  resp.data[a].devCosto,
        nombreProducto :  resp.data[a].nombreProducto,
        devCodigo : resp.data[a].devCodigo,
        devPrecio:resp.data[a].devPrecio,
        } as Idevolucion))
        this.dataSource = new MatTableDataSource(this.devoluciones);
        this.dataSource.paginator = this.paginator;
        this.loadData= false;
      }
    )
  }


  newDevolucion(){

    
    const  dialogRef = this.dialog.open(DialogDevolucionComponent , {width: dialog.tamaño });

    dialogRef.afterClosed().subscribe(res => {
      console.log("res: ", res);

    if (res != undefined)
    {
      this.f.controls['idFactura'].setValue(res.detIdFactura);
      this.f.controls['producto'].setValue(res.codigoPils);
      this.idDetalle = res.detId;
      this.idProducto=res.detIdProducto;
      this.cantidadAnterior = res.detCantidad;
      this.f.controls['precio'].setValue(res.detPrecio);
    } 
    })

  }

  editDevolucion(devolucion : Idevolucion){
    this.f.controls['idFactura'].setValue(devolucion.devIdFac);
    this.f.controls['cantidad'].setValue(devolucion.devCantidad);
    this.f.controls['costo'].setValue(devolucion.devCosto);
    this.f.controls['producto'].setValue(devolucion.devCodigo);
    this.f.controls['precio'].setValue(devolucion.devPrecio);
    this.id= devolucion.devId;
    this.editar = true;

  }

limpiarControles(){
  this.f.controls['idFactura'].setValue(' ');
  this.f.controls['cantidad'].setValue(' ');
  this.f.controls['producto'].setValue(' ');
  this.f.controls['costo'].setValue(' ');
  this.f.controls['motivo'].setValue(' '); 
  this.f.controls['precio'].setValue(' '); 

}

deleteDevolucion(dev: Idevolucion){
  this.loadData = true;

  alerts.confirmAlert("¿ Desea eliminar la devolucion ?", "Los datos no se podran recuperar", "warning", "Si, eliminar").then(
    (result) => {
      if (result.isConfirmed) {
        this.devolucionesService.deleteData(dev.devId).subscribe(
          res => {
            if (res.exito === 1) {
              this.getData();
              this.loadData = false;
            } else {
              alerts.basicAlert('Error Servidor', res.mensaje, 'error');
              this.loadData = false;
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

  guardar(){
    this.formSubmitted = true;

    if (this.f.invalid) {
      alerts.basicAlert('Error','Ingrese todos los datos','error' );
      return;
    }

    if (this.cantidadAnterior < this.f.controls['cantidad'].value) {
      alerts.basicAlert('Error','La cantidad de devolucion es mayor que la comprada','error' );
      return;
    }

    this.loadData = true;
    /*===========================================
    Capturar la información del formulario en la Interfaz
    =========================================*/

    const dataDevolucion: Idevolucion = {

      devId: this.id,
      devIdFac : this.f.controls['idFactura'].value,
      devIdDetalle: this.idDetalle,
      devCantidad :this.f.controls['cantidad'].value,
      devFecha : new Date(),
      devIdProducto: this.idProducto,
      devMotivo:this.f.controls['motivo'].value,
      devCosto : this.f.controls['costo'].value,
      devCodigo:this.f.controls['producto'].value,
      devPrecio:this.f.controls['precio'].value,
    }

    /*===========================================
    Guardar la informacion en base de datos
    =========================================*/
    alerts.confirmAlert("¿ Estás seguro de guardar la devolución ?", "La información ya no se puede actualizar", "warning", "Si, guardar").then(
      (result) => {
        if (result.isConfirmed) {


          if (this.editar) {

            this.devolucionesService.putData(dataDevolucion).subscribe(
              resp => {
                if (resp.exito === 1) {
                  this.loadData= false;
                  alerts.basicAlert('Ok', resp.mensaje, 'success');
                  this.limpiarControles()
                  this.getData();
                }else{
                  this.loadData= false;
                  alerts.basicAlert('Error Servidor', resp.mensaje, 'error');
                }
              }
            )
            
          }else{
            this.devolucionesService.postData(dataDevolucion).subscribe(
              resp => {
                if (resp.exito === 1) {
                  this.loadData= false;
                  alerts.basicAlert('Ok', resp.mensaje, 'success');
                  this.limpiarControles()
                  this.getData();
                }else{
                  this.loadData= false;
                  alerts.basicAlert('Error Servidor', resp.mensaje, 'error');
                }
              }
            )

          }
        }

        this.loadData= false;

      }
    )
  }


  /*=========================
Validacion formulario
==============================*/

invalidField(field: string) {
  return functions.invalidField(field, this.f, this.formSubmitted)
}

}
