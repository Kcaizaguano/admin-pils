import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { alerts } from 'src/app/helpers/alerts';
import { functions } from 'src/app/helpers/functions';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Icliente } from 'src/app/interface/icliente';
import { ClientesService } from 'src/app/services/clientes.service';
import { CiudadesService } from 'src/app/services/ciudades.service';

@Component({
  selector: 'app-dialog-cliente',
  templateUrl: './dialog-cliente.component.html',
  styleUrls: ['./dialog-cliente.component.css']
})
export class DialogClienteComponent implements OnInit {


  /*=================
  Grupo de Controles
  ===================*/

  public f: FormGroup = this.form.group({
    nombres: ['', [Validators.required, Validators.pattern('[a-zA-ZáéíóúñÁÉÍÓÚÑ ]*')]],
    apellidos: ['', [Validators.required, Validators.pattern('[a-zA-ZáéíóúñÁÉÍÓÚÑ ]*')]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern('[0-9]*')]],
    direccion: ['', [Validators.required]],
    ciudad: [1, [Validators.required]],
    identificacion: ['', {
      validators: [Validators.required, Validators.pattern('[0-9]*')],
      asyncValidators: [this.validarCedulaRuc()],
      updateOn: 'blur'
    }],

  })

  /*===========================================
Validación personalizada
===========================================*/


  get nombres() { return this.f.get('nombres') }
  get apellidos() { return this.f.get('apellidos') }
  get correo() { return this.f.get('correo') }
  get telefono() { return this.f.get('telefono') }
  get direccion() { return this.f.get('direccion') }
  get ciudad() { return this.f.get('ciudad') }
  get identificacion() { return this.f.get('identificacion') }





  /*===========================================
  Variable que valida el envío del formulario
    ===========================================*/

  formSubmitted = false;


  /*===========================================
    Variable para la información de los clientes
    ===========================================*/

  ciudades: any[] = [];
  clientes: Icliente[] = [];


  /*===========================================
  Variable para precara
  ===========================================*/

  loadData = false;

    /*===========================================
  Variable para precara
  ===========================================*/

tipoIdentificacion = '';


  /*===========================================
  Variables que almacenan informacion  para editar
  ===========================================*/

  cliId = 0;


  constructor(private form: FormBuilder,
    private clientesService: ClientesService,
    private ciudadesService: CiudadesService,
    public dialogRef:MatDialogRef<DialogClienteComponent>,
    @Inject(MAT_DIALOG_DATA) public cliente:Icliente
    )
    {
        /*===========================================
        Validar si existe un cliente 
        ===========================================*/
        if (this.cliente != null) {

          this.cliId = this.cliente.cliId;
          this.f.controls['identificacion'].setValue(this.cliente.cliIdentificacion);
          this.f.controls['nombres'].setValue(this.cliente.cliNombres);
          this.f.controls['apellidos'].setValue(this.cliente.cliApellidos);
          this.f.controls['direccion'].setValue(this.cliente.cliDireccion);
          this.f.controls['telefono'].setValue(this.cliente.cliTelefono);
          this.f.controls['correo'].setValue(this.cliente.cliEmail);
          this.f.controls['ciudad'].setValue(this.cliente.cliIdCiudad);
          this.tipoIdentificacion = this.cliente.cliTipoIdentificacion;
        }

    }


  ngOnInit(): void {


    this.clientesService.getData().subscribe(
      resp => {
        this.clientes = resp.data;
      }
    )

    this.ciudadesService.getData().subscribe(
      resp => {

        this.ciudades = resp.data;

      })

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

    const dataCLiente: Icliente = {

      cliId: 0,
      cliTipoIdentificacion: this.tipoIdentificacion,
      cliIdentificacion: this.f.controls['identificacion'].value,
      cliNombres: this.f.controls['nombres'].value.toUpperCase(),
      cliApellidos: this.f.controls['apellidos'].value.toUpperCase(),
      cliTelefono: this.f.controls['telefono'].value,
      cliEmail: this.f.controls['correo'].value,
      cliDireccion: this.f.controls['direccion'].value,
      cliIdCiudad: this.f.controls['ciudad'].value,
    }


    /*===========================================
    Guardar la informacion en base de datos
    =========================================*/

    this.clientesService.postData(dataCLiente).subscribe(
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

    const dataCLiente: Icliente = {

      cliId: this.cliId,
      cliTipoIdentificacion: this.tipoIdentificacion,
      cliIdentificacion: this.f.controls['identificacion'].value,
      cliNombres: this.f.controls['nombres'].value.toUpperCase(),
      cliApellidos: this.f.controls['apellidos'].value.toUpperCase(),
      cliTelefono: this.f.controls['telefono'].value,
      cliEmail: this.f.controls['correo'].value,
      cliDireccion: this.f.controls['direccion'].value,
      cliIdCiudad: this.f.controls['ciudad'].value,
    }

    /*===========================================
    Actualizar la informacion en base de datos
    =========================================*/

    this.clientesService.putData(dataCLiente).subscribe(
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

  /*===================================================
  Funcion para validar cedula o ruc
  ========================================================*/

  validarCedulaRuc() {
    
    return (control: AbstractControl) => {
      const valor = control.value;


      if (valor.length == 10) {

        this.tipoIdentificacion = 'Cedula';
        const cedula = control.value;

        return new Promise((resolve) => {

          if (this.clientes.find(a => a.cliIdentificacion === cedula)) {

            resolve({ cedulaRepetida: true })

          }

          if (!functions.validarCedula(cedula)) {

            resolve({ cedulaFalsa: true })

          }

          resolve(false)

        })

      }else {
        this.tipoIdentificacion = 'Ruc';

        const ruc = control.value;

        return new Promise((resolve) => {

          if(!functions.validarRUC(ruc)){
            resolve({ cedulaFalsa: true })

          }
  
          if (this.clientes.find(a => a.cliIdentificacion === ruc)) {
  
            resolve({ rucRepetida: true })
  
          }
  
          resolve(false)
  
        })
      }
    }
  }




}
