import { Component, OnInit } from '@angular/core';
import { ApiauthService } from 'src/app/services/apiauth.service';
import { FormBuilder, Validator, Validators } from '@angular/forms'
import { functions } from 'src/app/helpers/functions';
import { Ilogin } from 'src/app/interface/ilogin';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';
import { alerts } from 'src/app/helpers/alerts';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  /*===========================================
  Grupo de Controles
  ===========================================*/

  public f = this.form.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  })

  /*===========================================
  Variable que valida el envío del formulario
    ===========================================*/

  formSubmitted = false;


  constructor(private form: FormBuilder,
              private loginService: LoginService,
              private apiauthService: ApiauthService,
              private router: Router) {

/*===========================================
  No se pueda ir al login una vez autentificado
===========================================*/
    // esto descomentar cuando y temrine todo el login
    /*
        if (apiauthService.usuarioData) {
          this.router.navigate([''])
    
        }
        */
  }

  ngOnInit(): void {
  }

  login() {
/*===========================================
Validando que el formulario si se lo envio 
===========================================*/
    this.formSubmitted = true;

    if (this.f.invalid) {
      return;
    }

/*===========================================
Capturar la informacion del formulario en la interfaz
===========================================*/

    const data: Ilogin = {
      email: this.f.controls.email.value!,
      password: this.f.controls.password.value!,
    }

/*===========================================
  Ejecucion del servicio del login
===========================================*/

    this.apiauthService.login(data).subscribe(
      (response) => {
        if (response.exito === 1) {

        /*====================
          Ingresar al sistema 
        =====================*/

          this.router.navigate(['/']);

        }
      },
      (err) => {

        /*====================
          Error al ingresar al sistema  
        =====================*/

        alerts.basicAlert("Error", "Usuario o Contraseña incorrectos", "error");
      }
    )
  }

/*===========================================
Validacion formulario
===========================================*/

  invalidField(field: string) {
    return functions.invalidField(field, this.f, this.formSubmitted)
  }

}
