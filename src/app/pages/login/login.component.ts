import { Component, OnInit } from '@angular/core';
import { ApiauthService } from 'src/app/services/apiauth.service';
import { FormBuilder, Validator, Validators } from '@angular/forms'
import { functions } from 'src/app/helpers/functions';
import { Ilogin } from 'src/app/interface/ilogin';
import { LoginService } from 'src/app/services/login.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public f = this.form.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  })

  formSubmitted = false;


  constructor(private form: FormBuilder,
              private loginService:LoginService,
              private apiauthService:ApiauthService) { }

  ngOnInit(): void {

  }

  login() {


    this.formSubmitted = true;

    if (this.f.invalid) {
      return;
    }

    const data: Ilogin = {
      email: this.f.controls.email.value!,
      password: this.f.controls.password.value!,
    }


    

    this.apiauthService.login(data).subscribe(
      response => {
        console.log("response: ", response);
      }
    )
    

  }


  invalidField(field: string) {
    return functions.invalidField(field, this.f, this.formSubmitted)
  }

}
