import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { alerts } from 'src/app/helpers/alerts';
import { functions } from 'src/app/helpers/functions';
import { Ialmacen } from 'src/app/interface/ialmacen';
import { AlmacenesService } from 'src/app/services/almacenes.service';
import {MatSlideToggleChange}  from '@angular/material/slide-toggle'


@Component({
  selector: 'app-dialog-almacen',
  templateUrl: './dialog-almacen.component.html',
  styleUrls: ['./dialog-almacen.component.css']
})
export class DialogAlmacenComponent {


  /*=================
  Grupo de Controles
  ===================*/

  public f: FormGroup = this.form.group({
    almacen: ['', [Validators.required, Validators.pattern('[a-z0-9A-ZáéíóúñÁÉÍÓÚÑ,.-/() ]*')]],
    descripcion: ['', Validators.pattern('[a-z0-9A-ZáéíóúñÁÉÍÓÚÑ,.-/() ]*')]
  })

  /*==========================
  Validación personalizada
  ================================*/
  get almacens() { return this.f.get('almacen') }
  get descripcion() { return this.f.get('descripcion') }

  /*===========================================
  Variable que valida el envío del formulario
    ===========================================*/

  formSubmitted = false;

  /*===========================================
  Variable para precara
  ===========================================*/

  loadData = false;

  /*===========================================
  Variables que almacenan informacion  para editar
  ===========================================*/

  almId = 0;

      /*===========================================
    Variable  para definir el estado del item
    ===========================================*/
  
    visible = false;


  constructor(private form: FormBuilder,
    private almacenesService: AlmacenesService,
    public dialogRef: MatDialogRef<DialogAlmacenComponent>,
    @Inject(MAT_DIALOG_DATA) public almacen: Ialmacen) {
    /*===========================================
    Validar si existe un almacen
    ===========================================*/
    if (this.almacen != null) {

      this.almId = this.almacen.almId;
      this.f.controls['almacen'].setValue(this.almacen.almNombre);
      this.f.controls['descripcion'].setValue(this.almacen.almDescripcion);

      if (this.almacen.almEstado === 1) {
        this.visible = true;
        
      }
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

    this.loadData = true;


    /*===========================================
    Capturar la información del formulario en la Interfaz
    =========================================*/

    const dataAlmacen: Ialmacen = {

      almId: 0,
      almNombre: this.f.controls['almacen'].value.toUpperCase(),
      almDescripcion: this.f.controls['descripcion'].value,
      almEstado: 1
    }

    /*===========================================
Guardar la informacion en base de datos
=========================================*/

    this.almacenesService.postData(dataAlmacen).subscribe(
      resp => {
        if (resp.exito === 1) {
          this.loadData = false;
          alerts.basicAlert('Ok', resp.mensaje, 'success');
          this.dialogRef.close('save');
        } else {
          this.loadData = false;
          alerts.basicAlert('Error Servidor', resp.mensaje, 'error');
          this.dialogRef.close('save');
        }
      }
    )
  }

  /*=========================
  Funcón para editar un cliente
  ==============================*/

  editar() {

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

    const dataAlmacen: Ialmacen = {

      almId: this.almId,
      almNombre: this.f.controls['almacen'].value,
      almDescripcion: this.f.controls['descripcion'].value,
      almEstado:this.visible?1:0

    }

    /*===========================================
    Actualizar la informacion en base de datos
    =========================================*/

    this.almacenesService.putData(dataAlmacen).subscribe(
      resp => {
        if (resp.exito === 1) {
          this.loadData = false;
          this.dialogRef.close('save');
          alerts.basicAlert('Ok', resp.mensaje, 'success');
        } else {
          this.loadData = false;
          this.dialogRef.close('save');
          alerts.basicAlert('Error Servidor', resp.mensaje, 'error');
        }
      }
    )
  }



  /*=========================
Validacion formulario
==============================*/

  invalidField(field: string) {
    return functions.invalidField(field, this.f, this.formSubmitted)
  }

/*=========================
Cambiar el estado del item
==============================*/

  activo(event : MatSlideToggleChange){

    this.visible = event.checked;
  
  }


}
