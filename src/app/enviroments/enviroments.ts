import { HttpHeaders } from "@angular/common/http";


export const enviroment = {

    urlServidor :'http://localhost:43466/api/',
    urServidorImagen :'http://localhost:43466/'

    

}

export const dialog = {
  tamaño:'80%'
}

export const httpOption = {
    headers: new HttpHeaders({
      'Contend-Type': 'application/json',
    }),
    //withCredentials: true
  };