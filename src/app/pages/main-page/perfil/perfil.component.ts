import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { enviroment } from 'src/app/enviroments/enviroments';
import { alerts } from 'src/app/helpers/alerts';
import { functions } from 'src/app/helpers/functions';
import { IUsersLogin } from 'src/app/interface/i-users-login';
import { Iempleados } from 'src/app/interface/iempleados';
import { AlmacenesService } from 'src/app/services/almacenes.service';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { ImagenesService } from 'src/app/services/imagenes.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {


  /*=================
  Grupo de Controles
  ===================*/

  public f: FormGroup = this.form.group({
    cedula: ['', [Validators.required, Validators.pattern('[0-9]*')]],
    nombres: ['', [Validators.required, Validators.pattern('[a-zA-ZáéíóúñÁÉÍÓÚÑ ]*')]],
    apellidos: ['', [Validators.required, Validators.pattern('[a-zA-ZáéíóúñÁÉÍÓÚÑ ]*')]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern('[0-9]*')]],
    direccion: ['', [Validators.required]],
    estadoCivil: ['', [Validators.required]],
    genero: ['', [Validators.required]],
    imagen: "",
    cargo: [{ value: '', disabled: true }, Validators.required],
    almacen: [{ value: '', disabled: true }, Validators.required],
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
  nameImage = "";
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
  empleado!:Iempleados;
  activo = 0;

    /*===========================================
  Variable para precara
  ===========================================*/

  loadData = false;




  constructor(private form: FormBuilder,
    private almacenesService: AlmacenesService,
    private empleadosService: EmpleadosService,
    private imagenesService: ImagenesService,
    private sanitizer: DomSanitizer,
    ) {



  }



  async ngOnInit(): Promise<void> {

    const usuario = JSON.parse(localStorage.getItem('usuario')! );
    this.empId = usuario.id;
    this.almacenes = await functions.verificacionAlmacenes(this.almacenesService);
    this.cargarEmpleado();

  }



  
  cargarEmpleado(){


    this.empleadosService.getItem(this.empId.toString()).subscribe(
      resp => {
          this.empleado = resp.data;
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
          this.f.controls['cargo'].setValue(this.empleado.usuario.logCargo)
          this.f.controls['clave'].setValue(this.empleado.usuario.logClave)
          this.logId = this.empleado.usuario.logId;
          this.imgTemp = this.empleado.empUrlImagen;
          this.urlImagen = this.empleado.empUrlImagen;
          this.activo = this.empleado.empActivo;
    
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
            const nombreImagenBorrar = functions.nombreImagen(this.urlImagen,'User');
            this.urlImagen = enviroment.urServidorImagen + res.data;
            this.imagenesService.deleteImage('User',nombreImagenBorrar).subscribe(
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
    empActivo: this.activo,
    usuario: dataUsuario
  }


  /*===========================================
  Actualizar la informacion en base de datos
  =========================================*/

  this.empleadosService.putData(dataEmpleado).subscribe(
    resp => {
      if (resp.exito === 1) {
        this.loadData = false;
        alerts.basicAlert('Ok', resp.mensaje, 'success');
        this.cargarEmpleado();
      } else {
        this.loadData = false;
        alerts.basicAlert('Error Servidor', resp.mensaje, 'error');
      }
    }
  )
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

  /*===========================================
  Función para la seguridad de la URL
  ===========================================*/

  sanitizeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

}
