import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { alerts } from 'src/app/helpers/alerts';
import { functions } from 'src/app/helpers/functions';
import { Iempleados } from 'src/app/interface/iempleados';
import { AlmacenesService } from 'src/app/services/almacenes.service';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IUsersLogin } from 'src/app/interface/i-users-login';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ImagenesService } from 'src/app/services/imagenes.service';
import { enviroment } from 'src/app/enviroments/enviroments';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


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
    clave: ""

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
  uploadFile: any;
  urlImagen = "";



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

  /*===========================================
  Variable  para definir el estado del usuario
  ===========================================*/
  visible = false;

  constructor(private form: FormBuilder,
    private almacenesService: AlmacenesService,
    private empleadosService: EmpleadosService,
    private imagenesService: ImagenesService,
    private sanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<DialogUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public empleado: Iempleados) {


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
      this.imgTemp = this.empleado.empUrlImagen;
      this.urlImagen = this.empleado.empUrlImagen;
      if (this.empleado.empActivo === 1) {
        this.visible = true;

      }

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
        this.almacenes = this.almacenes.filter((item:any) => item.almEstado === 1);
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

  async guardar() {

    /*===========================================
    Validando que el formulario si se lo envio 
    ===========================================*/
    this.formSubmitted = true;

    if (this.f.invalid) {
      return;
    }

    this.loadData = true;

    /*======================
    Subir imagen al servidor  
    ========================*/

    if (this.uploadFile) {

      
      const subirImagen = new Promise<void>((resolve, reject) => {

        this.imagenesService.post(this.uploadFile, 'User').subscribe(
          res => {
            if (res.exito === 1) {
              this.urlImagen = enviroment.urServidorImagen + res.data;
              resolve();
            } else {
              reject()
            }
          }
        )
      });

      await subirImagen


      
    }



    /*===========================================
    Capturar la información del formulario en la Interfaz
    =========================================*/
    var dataUsuario: IUsersLogin = {

      logId: 0,
      logUsuario: this.f.controls['correo'].value,
      logClave: '',
      logIdEmpleado: 0,
      logCargo: this.f.controls['cargo'].value,
      logUltimoAcceso: new Date
    }


    const dataEmpleado: Iempleados = {
      empId: 0,
      empNombres: this.f.controls['nombres'].value.toUpperCase(),
      empCedula: this.f.controls['cedula'].value,
      emplApellidos: this.f.controls['apellidos'].value.toUpperCase(),
      empDireccion: this.f.controls['direccion'].value,
      empTelefono: this.f.controls['telefono'].value,
      empEmail: this.f.controls['correo'].value,
      empGenero: this.f.controls['genero'].value,
      empEstadoCivil: this.f.controls['estadoCivil'].value,
      empIdAlmacen: Number(this.f.controls['almacen'].value),
      empUrlImagen: this.urlImagen,
      empActivo: 1,
      usuario: dataUsuario
    }


    /*===========================================
    Guardar la informacion en base de datos
    =========================================*/

    this.empleadosService.postData(dataEmpleado).subscribe(
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
Funcón para editar un empleado 
==============================*/

  async editar() {
    /*===========================================
    Validando que el formulario si se lo envio 
    ===========================================*/
    this.formSubmitted = true;

    if (this.f.invalid) {
      return;
    }

    this.loadData = true;


    /*======================
    Subir imagen al servidor  
    ========================*/
    if (this.uploadFile) {

      const subirImagen = new Promise<void>((resolve, reject) => {

        this.imagenesService.post(this.uploadFile, 'User').subscribe(
          res => {
            if (res.exito === 1) {
              const nombreImagenBorrar = functions.nombreImagen(this.urlImagen, 'User');
              this.urlImagen = enviroment.urServidorImagen + res.data;
              this.imagenesService.deleteImage('User', nombreImagenBorrar).subscribe(
                resp => {

                }
              )
              resolve();
            } else {
              reject()
            }
          }
        )
      });

      await subirImagen

    }


    /*===========================================
    Capturar la información del formulario en la Interfaz
    =========================================*/
    var dataUsuario: IUsersLogin = {

      logId: this.logId,
      logUsuario: this.f.controls['correo'].value,
      logClave: this.f.controls['clave'].value,
      logIdEmpleado: this.empId,
      logCargo: this.f.controls['cargo'].value,
      logUltimoAcceso: new Date
    }


    const dataEmpleado: Iempleados = {
      empId: this.empId,
      empNombres: this.f.controls['nombres'].value.toUpperCase(),
      empCedula: this.f.controls['cedula'].value,
      emplApellidos: this.f.controls['apellidos'].value.toUpperCase(),
      empDireccion: this.f.controls['direccion'].value,
      empTelefono: this.f.controls['telefono'].value,
      empEmail: this.f.controls['correo'].value,
      empGenero: this.f.controls['genero'].value,
      empEstadoCivil: this.f.controls['estadoCivil'].value,
      empIdAlmacen: Number(this.f.controls['almacen'].value),
      empUrlImagen: this.urlImagen,

      empActivo: this.visible ? 1 : 0,

      usuario: dataUsuario
    }


    /*===========================================
    Actualizar la informacion en base de datos
    =========================================*/

    this.empleadosService.putData(dataEmpleado).subscribe(
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


  /*===================
Validacion de imagen
=======================*/

  validarImagen(e: any) {

    functions.validateImage(e).then(
      (resp: any) => {
        this.imgTemp = resp;
        this.uploadFile = e.target.files[0];
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



  /*=========================
 Cambiar el estado del cliente
  ==============================*/

  activo(event: MatSlideToggleChange) {

    this.visible = event.checked;

  }

  /*===========================================
  Función para la seguridad de la URL
  ===========================================*/

  sanitizeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

}
