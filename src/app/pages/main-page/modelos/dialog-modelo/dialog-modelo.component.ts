import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { alerts } from 'src/app/helpers/alerts';
import { functions } from 'src/app/helpers/functions';
import { Imodelo } from 'src/app/interface/imodelo';
import { ModelosService } from 'src/app/services/modelos.service';
import {MatSlideToggleChange}  from '@angular/material/slide-toggle'


@Component({
  selector: 'app-dialog-modelo',
  templateUrl: './dialog-modelo.component.html',
  styleUrls: ['./dialog-modelo.component.css']
})
export class DialogModeloComponent {


  /*=================
  Grupo de Controles
  ===================*/

  public f: FormGroup = this.form.group({
    modelo: ['', [Validators.required, Validators.pattern('[a-z0-9A-ZáéíóúñÁÉÍÓÚÑ,.-/() ]*')]],
    descripcion: ['', Validators.pattern('[a-z0-9A-ZáéíóúñÁÉÍÓÚÑ,.-/() ]*')]
  })

  /*==========================
  Validación personalizada
  ================================*/
  get modelos() { return this.f.get('modelo') }
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

  modId = 0;

        /*===========================================
    Variable  para definir el estado del item
    ===========================================*/
  
    visible = false;


  constructor(private form: FormBuilder,
    private modelosService: ModelosService,
    public dialogRef: MatDialogRef<DialogModeloComponent>,
    @Inject(MAT_DIALOG_DATA) public modelo: Imodelo) {
    /*===========================================
    Validar si existe un modelo
    ===========================================*/
    if (this.modelo != null) {

      this.modId = this.modelo.modId;
      this.f.controls['modelo'].setValue(this.modelo.modNombre);
      this.f.controls['descripcion'].setValue(this.modelo.modDescripcion);

      if (this.modelo.modEstado === 1) {
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

    const dataModelo: Imodelo = {

      modId: 0,
      modNombre: this.f.controls['modelo'].value.toUpperCase(),
      modDescripcion: this.f.controls['descripcion'].value,
      modEstado:1
    }

    /*===========================================
Guardar la informacion en base de datos
=========================================*/

    this.modelosService.postData(dataModelo).subscribe(
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

  const dataModelo: Imodelo = {

    modId: this.modId,
    modNombre: this.f.controls['modelo'].value.toUpperCase(),
    modDescripcion: this.f.controls['descripcion'].value,
    modEstado:this.visible?1:0

  }

  /*===========================================
  Actualizar la informacion en base de datos
  =========================================*/

  this.modelosService.putData(dataModelo).subscribe(
    resp => {
      if (resp.exito === 1) {
        this.loadData= false;
        this.dialogRef.close('save');
        alerts.basicAlert('Ok', resp.mensaje, 'success');
      }else{
        this.loadData= false;
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

activo(event : MatSlideToggleChange){

  this.visible = event.checked;

}


}
