import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { alerts } from 'src/app/helpers/alerts';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Ialmacen } from 'src/app/interface/ialmacen';
import { AlmacenesService } from 'src/app/services/almacenes.service';
import { ProductosService } from 'src/app/services/productos.service';

export interface IproductoAlmacenes {

  almProId: number,
  almacenId: number,
  productoId: number,
  stock: number
}

@Component({
  selector: 'app-dialog-almacen-repuesto',
  templateUrl: './dialog-almacen-repuesto.component.html',
  styleUrls: ['./dialog-almacen-repuesto.component.css']
})


export class DialogAlmacenRepuestoComponent implements OnInit{

    /*=================
  Grupo de Controles
  ===================*/
  public f: FormGroup = this.form.group({
    almacenId:['', {
      validators: [Validators.required,Validators.pattern('[0-9a-zA-Z]*')],
      asyncValidators: [this.almacenDuplicado()],
      updateOn: 'blur'
    }],
    stock: ['', Validators.required]
  })

  /*===========================================
  Validación personalizada
  ===========================================*/
  get almacenId() { return this.f.get('almacenId') }
  get stock() { return this.f.get('stock') }


  /*===========================================
  Variable que valida el envío del formulario
    ===========================================*/

    formSubmitted = false;

    /*===========================================
    Variable de precarga
    ===========================================*/
  
    loadData = false;

  /*===========================================
  Variable para la información de almacenes
  ===========================================*/

  almacenes: Ialmacen[] = [];
  almacenProducto: IproductoAlmacenes[] = [];



  constructor(private form: FormBuilder,
              private almacenesService:AlmacenesService,
              private productosService:ProductosService,
              public dialogRef:MatDialogRef<DialogAlmacenRepuestoComponent>,
              @Inject(MAT_DIALOG_DATA) public idRepuesto: any
  ) { }

  ngOnInit(): void {

    this.almacenesService.getData().subscribe(
      resp => {
        this.almacenes = resp.data;
      }
    )

    this.productosService.getItem(this.idRepuesto).subscribe(
      resp => {
        this.almacenProducto = resp.data.almacen
        
      }
    )

  }

  guardar(){
    /*===============================
    Validar que se envio el formulario 
    ================================*/

    this.formSubmitted = true;

    /*====================================
    Validar que el formulario esta correcto 
    ======================================*/

    if (this.f.invalid) {
      return;
    }

    
    /*===================================================
    Mientras la informacion se guarda en la base de datos 
    ====================================================*/

    this.loadData = true

    /*=================================================================
    Capturar la información del formulario del formulario en la interfaz
    ===================================================================*/

    const dataAlmacen: IproductoAlmacenes = {
      almProId: 0,
      almacenId: this.f.controls['almacenId'].value,
      productoId: Number( this.idRepuesto),
      stock: this.f.controls['stock'].value
    }



    /*===========================================
    Guardar información en la base de datos
    =========================================*/
    this.productosService.postAlmacenData(dataAlmacen).subscribe(
      resp => {
        if (resp.exito === 1) {
          this.loadData = false;
          alerts.basicAlert('Ok', resp.mensaje, 'success');
          this.dialogRef.close('save');
        } else {
          this.loadData = false;
          alerts.basicAlert('Ok', resp.mensaje, 'error');
          this.dialogRef.close();
        }
      }
    )

  }


  almacenDuplicado() {
    return (control: AbstractControl) => {
      const id = control.value;

      return new Promise((resolve) => {

        var idRepetido = false;
        this.almacenProducto.forEach(element => {
          if (element.almacenId == id) {
            idRepetido = true;
          }
        });
    
        if (idRepetido) {
          resolve({ idRepetido: true })

        }

        resolve(false)

      })
    }
    

  }

}
