import Swal,{SweetAlertIcon} from 'sweetalert2';

export class alerts{

/*===========================================
Función para alerta básica 
===========================================*/

    static basicAlert(title: string,text : string, icon:SweetAlertIcon ){

        Swal.fire(title,text,icon);

    }
    
}
