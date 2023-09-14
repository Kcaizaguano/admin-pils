import { Injectable } from '@angular/core';
import { Ilogin } from '../interface/ilogin';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor() { }

  login(data: Ilogin){
    return data

  }
}
