import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { alerts } from 'src/app/helpers/alerts';
import { functions } from 'src/app/helpers/functions';
import { Imarca } from 'src/app/interface/imarca';
import { MarcasService } from 'src/app/services/marcas.service';
import {MatSlideToggleChange}  from '@angular/material/slide-toggle'


@Component({
  selector: 'app-dialog-marca',
  templateUrl: './dialog-marca.component.html',
  styleUrls: ['./dialog-marca.component.css']
})
export class DialogMarcaComponent implements OnInit {


  /*=================
  Grupo de Controles
  ===================*/

  public f: FormGroup = this.form.group({
    marca: ['', [Validators.required, Validators.pattern('[a-z0-9A-ZáéíóúñÁÉÍÓÚÑ,.-/() ]*')]],
    descripcion: ['', Validators.pattern('[a-z0-9A-ZáéíóúñÁÉÍÓÚÑ,.-/() ]*')]
  })

  /*==========================
  Validación personalizada
  ================================*/
get marcas() { return this.f.get('marca') }
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

  marId = 0;

      /*===========================================
    Variable  para definir el estado del item
    ===========================================*/
  
    visible = false;

constructor(private form: FormBuilder,
            private marcasService: MarcasService,
            public dialogRef:MatDialogRef<DialogMarcaComponent>,
            @Inject(MAT_DIALOG_DATA) public marca:Imarca)
            {
                /*===========================================
                Validar si existe una marca
                ===========================================*/
                if (this.marca != null) {

                this.marId = this.marca.marId;
                this.f.controls['marca'].setValue(this.marca.marNombre);
                this.f.controls['descripcion'].setValue(this.marca.marDescripcion);

                if (this.marca.marEstado === 1) {
                  this.visible = true;
                  
                }
                }

            }

  ngOnInit(): void {}

guardar(){
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

    const dataMarca: Imarca = {

      marId: 0,
      marNombre: this.f.controls['marca'].value.toUpperCase(),
      marDescripcion: this.f.controls['descripcion'].value,
      marEstado:1
    }

        /*===========================================
    Guardar la informacion en base de datos
    =========================================*/

    this.marcasService.postData(dataMarca).subscribe(
      resp => {
        if (resp.exito === 1) {
          this.loadData= false;
          alerts.basicAlert('Ok', resp.mensaje, 'success');
          this.dialogRef.close('save');
        }else{
          this.loadData= false;
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

  const dataMarca: Imarca = {

    marId: this.marId,
    marNombre: this.f.controls['marca'].value.toUpperCase(),
    marDescripcion: this.f.controls['descripcion'].value,
    marEstado:this.visible?1:0

  }

  /*===========================================
  Actualizar la informacion en base de datos
  =========================================*/

  this.marcasService.putData(dataMarca).subscribe(
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
