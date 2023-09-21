import Swal, { SweetAlertIcon } from 'sweetalert2';

export class alerts {

    /*===========================================
    Función para alerta básica 
    ===========================================*/

    static basicAlert(title: string, text: string, icon: SweetAlertIcon) {

        Swal.fire(title, text, icon);

    }

    /*===========================================
    Función para alerta de confimación
    ===========================================*/


    static confirmAlert(title: string, text: string, icon: SweetAlertIcon, confirmButtonText: string) {
        return Swal.fire({
            title: title,
            text: text,
            icon: icon,
            confirmButtonText: confirmButtonText,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        })

    }

}
