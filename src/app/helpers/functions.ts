import { AbstractControl, FormGroup, ValidationErrors } from "@angular/forms";
import { alerts } from "./alerts";
import { enviroment } from "../enviroments/enviroments";
import { AlmacenesService } from "../services/almacenes.service";
import { firstValueFrom } from "rxjs";
import { UtilsService } from "../services/utils.service";
import { ModelosService } from "../services/modelos.service";
import { MarcasService } from "../services/marcas.service";
//import { alerts } from "./alerts";

export class functions {
    /*=======================
    Cargar listado de  almacen
    ======================*/

    static async verificacionAlmacenes(almacenesService: AlmacenesService): Promise<any[]> {
        const almacenesStorage = JSON.parse(localStorage.getItem('almacenes')!);
        if (!almacenesStorage || almacenesStorage.length === 0) {
            const resp = await firstValueFrom(almacenesService.getData());
            localStorage.setItem('almacenes', JSON.stringify(resp.data));
            return resp.data;
        } else {
            return almacenesStorage;
        }
    }

/*=======================
Cargar listado de  modelos
======================*/
    static async verificacionModelos(modelosService: ModelosService): Promise<any[]> {
        const modelosStorage = JSON.parse(localStorage.getItem('modelos')!);
        console.log("el storege es ");
        console.log(modelosStorage);
        if (!modelosStorage || modelosStorage.length === 0) {
            const resp = await firstValueFrom(modelosService.getData());
            const modelosOrdenadas = resp.data.sort((a: { modNombre: string; }, b: { modNombre: any; }) => a.modNombre.localeCompare(b.modNombre));
            localStorage.setItem('modelos', JSON.stringify(modelosOrdenadas));
            return resp.data;
        } else {
            return modelosStorage;
        }
    }

/*=======================
Cargar listado de  marcas
======================*/
    static async verificacionMarcas(marcasService: MarcasService): Promise<any[]> {
        const marcasStorage = JSON.parse(localStorage.getItem('marcas')!);
        if (!marcasStorage || marcasStorage.length === 0) {
            const resp = await firstValueFrom(marcasService.getData());
            const marcasOrdenadas = resp.data.sort((a: { marNombre: string; }, b: { marNombre: any; }) => a.marNombre.localeCompare(b.marNombre));
            localStorage.setItem('marcas', JSON.stringify(marcasOrdenadas));
            return resp.data;
        } else {
            return marcasStorage;
        }
    }

    /*===========================================
    Función para validar campos del formulario
    ===========================================*/

    static invalidField(field: string, f: FormGroup, formSubmitted: boolean): boolean {

        if (formSubmitted && f.controls[field].invalid) {
            return true;
        }
        else {
            return false;
        }

    }


    /*===========================================
    funcion para determinar el tamaño de pantalla
    ===========================================*/
    static dimencionPantalla(minWidth: number, maxWidth: number): boolean {


        if (window.matchMedia(`(min-width:${minWidth}px) and (max-width:${maxWidth}px)`).matches) {
            return true;
        } else {
            return false;
        }
    }

    /*===========================================
  Función para validar imagenes
  ===========================================*/

    static validateImage(e: any) {
        return new Promise(resolve => {
            const image = e.target.files[0];

            /*===================
            Validar el Formato 
            ====================*/

            if (image["type"] != "image/jpeg" && image["type"] != "image/PNG") {
                alert("ERROR: la imagen debe estar en formato PNG | JPG");
                return;

                /*===============================
                Validar el tamaño, maximo 2 Megas
                ================================*/
            } else if (image["size"] > 2000000) {
                alert("ERROR: Tamaño máximo de la imagen: 2MB");
                return;
            }

            /*===============================
            Mostrar la imagen temporal
            ================================*/
            else {
                let data = new FileReader();
                data.readAsDataURL(image);
                data.onloadend = () => {
                    resolve(data.result);

                }
            }
        })
    }



    /*===========================================
  Función para dar fromato a las fechas 
  ===========================================*/

    static formatDate(date: Date) {

        return `${date.getFullYear()}-${(`0` + date.getMonth() + 1).slice(-2)}-${(`0` + date.getDate()).slice(-2)}T00:00:00`;

    }

    /*===========================================
  Función para validar cédula Ecuatoriana
  ===========================================*/
    static validarCedula(cedula: string) {
        // Créditos: Victor Diaz De La Gasca.
        // Autor: Adrián Egüez
        // Url autor: https://gist.github.com/vickoman/7800717
        // Preguntamos si la cedula consta de 10 digitos
        if (cedula.length === 10) {

            // Obtenemos el digito de la region que sonlos dos primeros digitos
            const digitoRegion = cedula.substring(0, 2);

            // Pregunto si la region existe ecuador se divide en 24 regiones
            if (digitoRegion >= String(0) && digitoRegion <= String(24)) {

                // Extraigo el ultimo digito
                const ultimoDigito = Number(cedula.substring(9, 10));

                // Agrupo todos los pares y los sumo
                const pares = Number(cedula.substring(1, 2)) + Number(cedula.substring(3, 4)) + Number(cedula.substring(5, 6)) + Number(cedula.substring(7, 8));

                // Agrupo los impares, los multiplico por un factor de 2, si la resultante es > que 9 le restamos el 9 a la resultante
                let numeroUno: any = cedula.substring(0, 1);
                numeroUno = (numeroUno * 2);
                if (numeroUno > 9) {
                    numeroUno = (numeroUno - 9);
                }

                let numeroTres: any = cedula.substring(2, 3);
                numeroTres = (numeroTres * 2);
                if (numeroTres > 9) {
                    numeroTres = (numeroTres - 9);
                }

                let numeroCinco: any = cedula.substring(4, 5);
                numeroCinco = (numeroCinco * 2);
                if (numeroCinco > 9) {
                    numeroCinco = (numeroCinco - 9);
                }

                let numeroSiete: any = cedula.substring(6, 7);
                numeroSiete = (numeroSiete * 2);
                if (numeroSiete > 9) {
                    numeroSiete = (numeroSiete - 9);
                }

                let numeroNueve: any = cedula.substring(8, 9);
                numeroNueve = (numeroNueve * 2);
                if (numeroNueve > 9) {
                    numeroNueve = (numeroNueve - 9);
                }

                const impares = numeroUno + numeroTres + numeroCinco + numeroSiete + numeroNueve;

                // Suma total
                const sumaTotal = (pares + impares);

                // extraemos el primero digito
                const primerDigitoSuma = String(sumaTotal).substring(0, 1);

                // Obtenemos la decena inmediata
                const decena = (Number(primerDigitoSuma) + 1) * 10;

                // Obtenemos la resta de la decena inmediata - la suma_total esto nos da el digito validador
                let digitoValidador = decena - sumaTotal;

                // Si el digito validador es = a 10 toma el valor de 0
                if (digitoValidador === 10) {
                    digitoValidador = 0;
                }

                // Validamos que el digito validador sea igual al de la cedula
                if (digitoValidador === ultimoDigito) {
                    return true;
                } else {
                    return false;
                }

            } else {
                // imprimimos en consola si la region no pertenece
                return false;
            }
        } else {
            // Imprimimos en consola si la cedula tiene mas o menos de 10 digitos
            return false;
        }

    }


    /*===========================================
    Función para dar formato con dos decimales
    ===========================================*/

    static aproximarDosDecimales(numero: number): number {
        var salida = Math.round(numero * 100) / 100;
        return Number(salida.toFixed(2));
    }



    static validarRUC(ruc: string) {
        // Verificar que el RUC tenga 13 dígitos
        if (ruc.length !== 13 || isNaN(Number(ruc))) {
            return false;
        }

        switch (ruc) {
            case "0000000000000": return false;
            case "1111111111111": return false;
            case "2222222222222": return false;
            case "3333333333333": return false;
            case "4444444444444": return false;
            case "5555555555555": return false;
            case "6666666666666": return false;
            case "7777777777777": return false;
            case "8888888888888": return false;
            case "9999999999999": return false;
        }

        return true;
    }

    /*===========================================
  Función para obtener nombre de la imagen
  ===========================================*/

    static nombreImagen(url: string, carpeta: string) {
        const eliminar = `${enviroment.urServidorImagen}Images/${carpeta}/`;

        return url?.replace(eliminar, "");

    }

    /*===========================================
  Función  cambio de id por nombre de marcas 
  ===========================================*/

    static obtenerMarcaID(lst: any) {
        let valores: string[] = [];

        for (let item of lst) {
            valores.push(item.marca);
        }

        return valores;

    }


    /*===========================================
  Función  cambio de id por nombre de  modelos
  ===========================================*/

    static obtenerModeloID(lst: any) {
        let valores: string[] = [];

        for (let item of lst) {
            valores.push(item.modelo);
        }

        return valores;

    }

/*===========================================
Función  cambio  generica
===========================================*/

    static obtenerPorPropiedad(lst: any[], propiedad: string): any[] {
          // Validamos que lst sea un array
    if (!Array.isArray(lst)) {
        throw new Error("El primer parámetro debe ser un array");
    }

    let valores: any[] = [];
    for (let item of lst) {
        // Si la propiedad existe en el objeto, la agregamos al resultado
        if (item.hasOwnProperty(propiedad)) {
            valores.push(item[propiedad]);
        } else {
            valores.push(null); // o undefined si prefieres
        }
    }

    return valores;
}



}




