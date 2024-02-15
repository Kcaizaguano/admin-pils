import { HttpHeaders } from "@angular/common/http";


export const enviroment = {

    urlServidor :'https://pilsautorepuesto-001-site1.ftempurl.com/api/',
    urServidorImagen :'https://pilsautorepuesto-001-site1.ftempurl.com/'
    

    

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