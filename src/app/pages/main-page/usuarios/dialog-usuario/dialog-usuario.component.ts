import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { alerts } from 'src/app/helpers/alerts';
import { functions } from 'src/app/helpers/functions';
import { Iempleados } from 'src/app/interface/iempleados';
import { AlmacenesService } from 'src/app/services/almacenes.service';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IUsersLogin } from 'src/app/interface/i-users-login';


//esto le agrego




@Component({
  selector: 'app-dialog-usuario',
  templateUrl: './dialog-usuario.component.html',
  styleUrls: ['./dialog-usuario.component.css']
})
export class DialogUsuarioComponent implements OnInit {

  /*=================
  Grupo de Controles
  ===================*/

  public f: FormGroup = this.form.group({
    //cedula: ['', [Validators.required, Validators.pattern('[0-9]*')]],
    cedula: ['', {
      validators: [Validators.required, Validators.pattern('[0-9]*')],
      asyncValidators: [this.validarCedula()],
      updateOn: 'blur'
    }],
    nombres: ['', [Validators.required, Validators.pattern('[a-zA-ZáéíóúñÁÉÍÓÚÑ ]*')]],
    apellidos: ['', [Validators.required, Validators.pattern('[a-zA-ZáéíóúñÁÉÍÓÚÑ ]*')]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern('[0-9]*')]],
    direccion: ['', [Validators.required]],
    estadoCivil: ['', [Validators.required]],
    genero: ['', [Validators.required]],
    imagen: "",
    cargo: ['', [Validators.required]],
    almacen: ['', [Validators.required]],
    clave:""

  })


  /*===========================================
  Validación personalizada
  ===========================================*/

  get imagen() { return this.f.get('imagen') }
  get nombres() { return this.f.get('nombres') }
  get apellidos() { return this.f.get('apellidos') }
  get almacen() { return this.f.get('almacen') }
  get cedula() { return this.f.get('cedula') }
  get correo() { return this.f.get('correo') }
  get telefono() { return this.f.get('telefono') }



  /*===========================================
Variable que valida el envío del formulario
  ===========================================*/

  formSubmitted = false;


  /*===========================================
  Variable que almacene la imagen temporal
  ===========================================*/

  imgTemp = "";


  /*===========================================
  Variable para la información de los almacenes y empleados
  ===========================================*/

  almacenes: any = [];
  empleados: Iempleados[] = [];

  
  /*===========================================
  Variables que almacenan informacion  para editar
  ===========================================*/

  empId = 0;
  logId = 0;

  constructor(private form: FormBuilder,
    private almacenesService: AlmacenesService,
    private empleadosService: EmpleadosService,
    public dialogRef:MatDialogRef<DialogUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public empleado:Iempleados ) 
    { 
        /*===========================================
        Validar si tiene un nuevo empleado 
        ===========================================*/
        if (this.empleado != null) {
          this.empId = this.empleado.empId;
          this.f.controls['cedula'].setValue(this.empleado.empCedula)
          this.f.controls['nombres'].setValue(this.empleado.empNombres)
          this.f.controls['apellidos'].setValue(this.empleado.emplApellidos)
          this.f.controls['direccion'].setValue(this.empleado.empDireccion)
          this.f.controls['telefono'].setValue(this.empleado.empTelefono)
          this.f.controls['correo'].setValue(this.empleado.empEmail)
          this.f.controls['genero'].setValue(this.empleado.empGenero)
          this.f.controls['estadoCivil'].setValue(this.empleado.empEstadoCivil)
          this.f.controls['almacen'].setValue(this.empleado.empIdAlmacen)
          this.f.controls['imagen'].setValue(this.empleado.empUrlImagen)
          this.f.controls['cargo'].setValue(this.empleado.usuario.logCargo)
          this.f.controls['clave'].setValue(this.empleado.usuario.logClave)
          this.logId = this.empleado.usuario.logId;
          
        }

    }



  /*===========================================
  Variable para precara
  ===========================================*/

  loadData = false;

  ngOnInit(): void {

    this.almacenesService.getData().subscribe(
      (resp) => {
        this.almacenes = resp.data;
      }
    )

    this.empleadosService.getData().subscribe(
      (resp) => {
        this.empleados = resp.data;
      }
    )


  }


    /*=========================
Función para guardar un empleado 
==============================*/

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
    var dataUsuario:IUsersLogin = {
      
      logId: 0,
      logUsuario: this.f.controls['correo'].value,
      logClave: '',
      logIdEmpleado: 0,
      logCargo: this.f.controls['cargo'].value,
      logUltimoAcceso:  new Date
    }


    const dataEmpleado: Iempleados = {
      empId: 0,
      empNombres: this.f.controls['nombres'].value,
      empCedula: this.f.controls['cedula'].value,
      emplApellidos: this.f.controls['apellidos'].value,
      empDireccion: this.f.controls['direccion'].value,
      empTelefono: this.f.controls['telefono'].value,
      empEmail: this.f.controls['correo'].value,
      empGenero: this.f.controls['genero'].value,
      empEstadoCivil: this.f.controls['estadoCivil'].value,
      empIdAlmacen: Number(this.f.controls['almacen'].value),
      empUrlImagen: this.f.controls['imagen'].value,
      usuario:dataUsuario
    }


    /*===========================================
    Guardar la informacion en base de datos
    =========================================*/

    this.empleadosService.postData(dataEmpleado).subscribe(
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
Funcón para editar un empleado 
==============================*/

  editar(){
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
    var dataUsuario:IUsersLogin = {
      
      logId: this.logId,
      logUsuario: this.f.controls['correo'].value,
      logClave: this.f.controls['clave'].value,
      logIdEmpleado: this.empId,
      logCargo: this.f.controls['cargo'].value,
      logUltimoAcceso:  new Date
    }


    const dataEmpleado: Iempleados = {
      empId: this.empId,
      empNombres: this.f.controls['nombres'].value,
      empCedula: this.f.controls['cedula'].value,
      emplApellidos: this.f.controls['apellidos'].value,
      empDireccion: this.f.controls['direccion'].value,
      empTelefono: this.f.controls['telefono'].value,
      empEmail: this.f.controls['correo'].value,
      empGenero: this.f.controls['genero'].value,
      empEstadoCivil: this.f.controls['estadoCivil'].value,
      empIdAlmacen: Number(this.f.controls['almacen'].value),
      empUrlImagen: this.f.controls['imagen'].value,
      usuario:dataUsuario
    }

    /*===========================================
    Actualizar la informacion en base de datos
    =========================================*/

    this.empleadosService.putData(dataEmpleado).subscribe(
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





  /*===================
Validacion de imagen
=======================*/

  validarImagen(e: any) {

    functions.validateImage(e).then(
      (resp: any) => {
        this.imgTemp = resp;
      })

  }




  /*===================
Cédula repetida
=======================*/

  validarCedula() {

    return (control: AbstractControl) => {
      const cedula = control.value;

      return new Promise((resolve) => {

        if (this.empleados.find(a => a.empCedula === cedula)) {

          resolve({ cedulaRepetida: true })

        }

        if (!functions.validarCedula(cedula)) {

          resolve({ cedulaFalsa: true })

        }

        resolve(false)

      })
    }
  }





}
