import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { alerts } from 'src/app/helpers/alerts';
import { functions } from 'src/app/helpers/functions';
import { IproductoModelos } from 'src/app/interface/iproducto-modelos';
import { ModelosService } from 'src/app/services/modelos.service';
import { ProductosService } from 'src/app/services/productos.service';

@Component({
  selector: 'app-dialog-modelos-repuestos',
  templateUrl: './dialog-modelos-repuestos.component.html',
  styleUrls: ['./dialog-modelos-repuestos.component.css']
})
export class DialogModelosRepuestosComponent implements OnInit {

  /*=================
  Grupo de Controles
  ===================*/

  public f: FormGroup = this.form.group({
    modelo: ['', {
      validators: Validators.required,
      asyncValidators: [this.validarModeloRepetido()],
      updateOn: 'blur'
    }],
  })


  /*==========================
  Validación personalizada
  ================================*/

  get modelo() { return this.f.get('modelo') }


  /*===========================================
  Variable que valida el envío del formulario
    ===========================================*/

  formSubmitted = false;

  /*===========================================
  Variable para precara
  ===========================================*/

  loadData = false;

  /*===========================================
  Variable global para nombrar columnas 
  ===========================================*/
  displayedColumns: string[] = ['id', 'modelo', 'acciones'];

  /*===========================================
  Variable global que instancie la Data que aparecera en la Tabla
  ===========================================*/

  dataSource!: MatTableDataSource<IproductoModelos>;

  /*===========================================
  Paginacion y Orden
  ===========================================*/

  @ViewChild(MatPaginator) paginator!: MatPaginator;


  /*===========================================
  Variables globales de la interfaz de usuario
  ===========================================*/

  modelos: IproductoModelos[] = [];
  lstmodelo: any[] = [];



  /*===========================================
  Variable para el id del producto 
  ===========================================*/

  idProducto = 0;


  constructor(private form: FormBuilder,
    public dialogRef: MatDialogRef<DialogModelosRepuestosComponent>,
    public productosService: ProductosService,
    public modelosService:ModelosService,
    @Inject(MAT_DIALOG_DATA) public idRepuesto: any

  ) {
    this.idProducto = Number(idRepuesto);
  }


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

    
    this.productosService.getItem(this.idProducto.toString()).subscribe(
      resp => {

        this.modelosService.getData().subscribe(
          resp2 => {
    
            this.lstmodelo = resp2.data;
            this.lstmodelo = this.lstmodelo.filter(item => item.modEstado === 1);
            this.lstmodelo.sort((a, b) => {
              if (a.modNombre < b.modNombre) {
                return -1;
              } else if (a.modNombre > b.modNombre) {
                return 1;
              } else {
                return 0;
              }
            });



            this.modelos = Object.keys(resp.data.modelos).map(a => ({
              proModId: resp.data.modelos[a].proModId,
              idProducto: resp.data.modelos[a].idProducto,
              idModelo: resp.data.modelos[a].idModelo,
              nombre: this.lstmodelo.find(m => m.modId === resp.data.modelos[a].idModelo)?.modNombre
    
            } as IproductoModelos))



    
            this.dataSource = new MatTableDataSource(this.modelos);
            this.dataSource.paginator = this.paginator;
            this.loadData = false;
          }
        )

      }
      
    )

  }


    /*=========================
  Validacion formulario
  ==============================*/

  invalidField(field: string) {
    return functions.invalidField(field, this.f, this.formSubmitted)
  }


  deleteModelo( modelo: IproductoModelos) {


    alerts.confirmAlertSecondary("¿ Estás seguro de eliminar ?", "La información ya no se puede recuperar","warning","Si, eliminar",this.dialogRef.id).then(
      (result)=> {

        if (result.isConfirmed) {
          this.productosService.deleteDataModelo(modelo.proModId).subscribe(
            resp =>{
              if (resp.exito === 1) {
               // alert(resp.mensaje);
                this.getData();
              }else{
                alert(resp.mensaje );
              }
            }
          )
          
        }
      }
    )
  }



  guardar() {

    /*===========================================
    Validando que el formulario si se lo envio 
    ===========================================*/
    this.formSubmitted = true;

    if (this.f.invalid) {
      return;
    }


    this.loadData = true;

    /*===========================================
    Capturar la información del formulario en la Interfaz
    =========================================*/

    const dataproductoModelo: IproductoModelos = {
      proModId: 0,
      idProducto: this.idProducto,
      idModelo: this.f.controls['modelo'].value

    }

    /*===========================================
    Guardar información en la base de datos
    =========================================*/
    this.productosService.postModeloData(dataproductoModelo).subscribe(
      resp => {
        if (resp.exito === 1) {
          this.loadData = false;
          this.getData();
          this.f.controls['modelo'].setValue(' ');
        } else {
          this.loadData = false;
        }
      }
    )

  }


    /*===========================================
    Validar que el modelo no se repita
    ===========================================*/
    validarModeloRepetido() {

      return (control: AbstractControl) => {
        const modelo = control.value;
  
        return new Promise((resolve) => {
  
          var modeloRepetido = false;
          this.modelos.forEach(element => {
            if (element.idModelo == modelo) {
              modeloRepetido = true;
            }
          });
      
          if (modeloRepetido) {
            resolve({ modeloRepetido: true })
  
          }
  
          resolve(false)
  
        })
      }
    }

}
