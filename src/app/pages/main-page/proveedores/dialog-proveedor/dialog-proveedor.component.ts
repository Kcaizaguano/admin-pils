import { Component, Inject, OnInit } from '@angular/core';
import {  FormBuilder, FormGroup, Validators } from '@angular/forms'
import { alerts } from 'src/app/helpers/alerts';
import { functions } from 'src/app/helpers/functions';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProveedoresService } from 'src/app/services/proveedores.service';
import { Iproveedor } from 'src/app/interface/iproveedor';
import {MatSlideToggleChange}  from '@angular/material/slide-toggle'

@Component({
  selector: 'app-dialog-proveedor',
  templateUrl: './dialog-proveedor.component.html',
  styleUrls: ['./dialog-proveedor.component.css']
})
export class DialogProveedorComponent implements OnInit {


  /*=================
  Grupo de Controles
  ===================*/

  public f: FormGroup = this.form.group({
    proveedor: ['', [Validators.required,Validators.pattern('[a-z0-9A-ZáéíóúñÁÉÍÓÚÑ,.-/() ]*')]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern('[0-9]*')]],
    direccion: ['', [Validators.required]],
    descripcion:['']
  })

  /*===========================================
  Validación personalizada
  ===========================================*/
get proveedore() { return this.f.get('proveedor') }
get correo() { return this.f.get('correo') }
get telefono() { return this.f.get('telefono') }
get direccion() { return this.f.get('direccion') }
get descripcion() { return this.f.get('descripcion') }


  /*===========================================
  Variable que valida el envío del formulario
    ===========================================*/

    formSubmitted = false;


    /*===========================================
      Variable para la información de los clientes
      ===========================================*/
  
    proveedores: any[] = [];
  
  
    /*===========================================
    Variable para precara
    ===========================================*/
  
    loadData = false;
  
    /*===========================================
    Variable que almacenan informacion  para editar
    ===========================================*/
  
    proId = 0;

 
    /*===========================================
    Variable  para definir el estado del producto
    ===========================================*/
  
  visible = false;


    constructor(private form: FormBuilder,
      private proveedoresService: ProveedoresService,
      public dialogRef:MatDialogRef<DialogProveedorComponent>,
      @Inject(MAT_DIALOG_DATA) public proveedor:Iproveedor
      )
      {
          /*===========================================
          Validar si existe un proveedor 
          ===========================================*/
          if (this.proveedor != null) {
  
            this.proId = this.proveedor.proId;
            this.f.controls['proveedor'].setValue(this.proveedor.proNombre);
            this.f.controls['direccion'].setValue(this.proveedor.proDireccion);
            this.f.controls['telefono'].setValue(this.proveedor.proTelefono);
            this.f.controls['correo'].setValue(this.proveedor.proEmail);
            this.f.controls['descripcion'].setValue(this.proveedor.proDescripcion);

            if (this.proveedor.proActivo === 1) {
              this.visible = true;
              
            }
          }
  
      }


      ngOnInit(): void {


        this.proveedoresService.getData().subscribe(
          resp => {
            this.proveedores = resp.data;
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
    
        const dataProveedor: Iproveedor = {
    
          proId: 0,
          proNombre: this.f.controls['proveedor'].value.toUpperCase(),
          proTelefono: this.f.controls['telefono'].value,
          proEmail: this.f.controls['correo'].value,
          proDireccion: this.f.controls['direccion'].value,
          proDescripcion: this.f.controls['descripcion'].value,
          proActivo:1
        }
    
    
        /*===========================================
        Guardar la informacion en base de datos
        =========================================*/
    
        this.proveedoresService.postData(dataProveedor).subscribe(
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
Función para editar un proveedor
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

  const dataProveedor: Iproveedor = {

    proId: this.proId,
    proNombre: this.f.controls['proveedor'].value.toUpperCase(),
    proTelefono: this.f.controls['telefono'].value,
    proEmail: this.f.controls['correo'].value,
    proDireccion: this.f.controls['direccion'].value,
    proDescripcion: this.f.controls['descripcion'].value,
    proActivo:this.visible?1:0
  }

  /*===========================================
  Actualizar la informacion en base de datos
  =========================================*/

  this.proveedoresService.putData(dataProveedor).subscribe(
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


  /*=========================
 Cambiar el estado del proveedor
  ==============================*/

activo(event : MatSlideToggleChange){

  this.visible = event.checked;

}

}
