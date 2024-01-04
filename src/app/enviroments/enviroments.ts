import { HttpHeaders } from "@angular/common/http";


export const enviroment = {

    urlServidor :'http://localhost:9085/api/',
    urServidorImagen :'http://localhost:9085/'

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