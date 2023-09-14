import { FormGroup } from "@angular/forms";
//import { alerts } from "./alerts";

export class functions {

    static invalidField(field: string, f: FormGroup, formSubmitted: boolean): boolean {

        if (formSubmitted && f.controls[field].invalid) {
            return true;
        }
        else {
            return false;
        }

    }


    //funcion para determinar el tamaño de pantalla 
    static screenSize(minWidth: number, maxWidth: number): boolean {


        if (window.matchMedia(`(min-width:${minWidth}px) and (max-width:${maxWidth}px)`).matches) {
            return true;
        } else {
            return false;
        }
    }

    //FUNCION PARA VALIDAR IMAGENES 
    /*
    static validateImage(e: any) {
        return new Promise(resolve => {
            const image = e.target.files[0];
            if (image["type"] != "image/jpeg" && image["type"] != "image/PNG") {
                alerts.basicAlert("error", "la imagen debe estar en formato PNG | JPG", "error");
                return;
            } else if (image["size"] > 2000000) {
                alerts.basicAlert("error", "maximo hasta 2MB", "error");
                return;
            }

            //mostrar la imagen temporal 
            else {
                let data = new FileReader();
                data.readAsDataURL(image);
                data.onloadend = () => {
                    resolve(data.result);

                }
            }
        })
    }
    */


    //CREAR URL
    static createURL(value:string){
        value = value.toLowerCase();
        value = value.replace(/[ ]/g,"-")
        value = value.replace(/[á]/g,"a")
        value = value.replace(/[é]/g,"e")
        value = value.replace(/[í]/g,"i")
        value = value.replace(/[ó]/g,"o")
        value = value.replace(/[ú]/g,"u")
        value = value.replace(/[ñ]/g,"n")
        value = value.replace(/[,]/g,"")
        return value;

    }


    //FUNCION PARA DAR FORMATO A LAS FECHAS 

    static formatDate( date: Date){

        return `${date.getFullYear()}-${(`0`+ date.getMonth()+1).slice(-2)}-${(`0`+date.getDate()).slice(-2)}T00:00:00`;

    }

}

