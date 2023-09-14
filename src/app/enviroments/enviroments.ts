import { HttpHeaders } from "@angular/common/http";


export const enviroment = {

    urlServidor :'http://localhost:43466/api/'

}

export const httpOption = {
    headers: new HttpHeaders({
      'Contend-Type': 'application/json'
    })
  };