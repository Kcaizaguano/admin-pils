import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { alerts } from 'src/app/helpers/alerts';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Ialmacen } from 'src/app/interface/ialmacen';
import { AlmacenesService } from 'src/app/services/almacenes.service';
import { ProductosService } from 'src/app/services/productos.service';
import { of } from 'rxjs';
import { IAuditoriaRepuestoTransaccion } from 'src/app/interface/i-auditoria-repuesto-transaccion';
import { AudiTransaccionesRepService } from 'src/app/services/audi-transacciones-rep.service';

export interface IproductoAlmacenes {

  almProId: number,
  almacenId: number,
  productoId: number,
  stock: number
}

@Component({
  selector: 'app-dialog-almacen-repuesto',
  templateUrl: './dialog-almacen-repuesto.component.html',
  styleUrls: ['./dialog-almacen-repuesto.component.css']
})


export class DialogAlmacenRepuestoComponent implements OnInit {

  /*=================
Grupo de Controles
===================*/
  public f: FormGroup = this.form.group({
    almacenId: ['', {
      validators: [Validators.required, Validators.pattern('[0-9a-zA-Z]*')],
      asyncValidators: [this.almacenDuplicado()],
      updateOn: 'blur'
    }],
    stock: ['', Validators.required],
    almacenIdTransferencia: ['', Validators.pattern('[0-9a-zA-Z]*')]
  })

  /*===========================================
  Validación personalizada
  ===========================================*/
  get almacenId() { return this.f.get('almacenId') }
  get stock() { return this.f.get('stock') }
  get almacenIdTransferencia() { return this.f.get('almacenIdTransferencia') }


  /*===========================================
  Variable que valida el envío del formulario
    ===========================================*/

  formSubmitted = false;

  /*===========================================
  Variable de precarga
  ===========================================*/

  loadData = false;

  /*===========================================
  Variable para la información de almacenes
  ===========================================*/

  almacenes: Ialmacen[] = [];
  almacenAsignado: Ialmacen[] = [];

  almacenProducto: IproductoAlmacenes[] = [];

  /*===========================================
  Variable  para saber si es transferencia de un local
  ===========================================*/
  checkboxControl = new FormControl(false);

  /*===========================================
   Variable para el almacen que esta conectado
   ===========================================*/
  almacenIdConectado = 0;

  transferencia = false;
  empleadoId = 0;


  constructor(private form: FormBuilder,
    private almacenesService: AlmacenesService,
    private productosService: ProductosService,
    private audiTransaccionesRepService: AudiTransaccionesRepService,
    public dialogRef: MatDialogRef<DialogAlmacenRepuestoComponent>,
    @Inject(MAT_DIALOG_DATA) public idRepuesto: any
  ) { }

  ngOnInit(): void {

    const usuario = JSON.parse(localStorage.getItem('usuario')!);
    this.almacenIdConectado = usuario.almacen;
    this.empleadoId = usuario.id;

    this.almacenesService.getData().subscribe(
      resp => {
        this.almacenes = resp.data;
        this.almacenAsignado = this.almacenes.filter(item => item.almId != this.almacenIdConectado);
      }
    )

    this.productosService.getItem(this.idRepuesto).subscribe(
      resp => {
        this.almacenProducto = resp.data.almacen

      }
    )



  }

  guardar() {
    /*===============================
    Validar que se envio el formulario 
    ================================*/

    this.formSubmitted = true;

    /*====================================
    Validar que el formulario esta correcto 
    ======================================*/

    if (this.checkboxControl.value) {


      this.f.get('almacenIdTransferencia')?.setValidators([Validators.required]);
      this.f.get('almacenIdTransferencia')?.setAsyncValidators([this.transferenciaAlmacen()]);


    }

    this.f.get('almacenIdTransferencia')?.updateValueAndValidity();

    if (this.f.invalid) {
      return;
    }


    /*===================================================
    Mientras la informacion se guarda en la base de datos 
    ====================================================*/

    this.loadData = true


    /*===================================================
    Variable para validar cantidad 
    ====================================================*/

    var stockCompleto = true



    /*=================================================================
    Logica de negocio para saber si es transferencia de otro almacén 
    ===================================================================*/

    const stocRecibido = this.f.controls['stock'].value;


    if (this.checkboxControl.value) {

      this.transferencia = true;
      const idAlmacenRestar = this.f.controls['almacenIdTransferencia'].value;
      const almacenRestar = this.almacenProducto.find((a) => a.almacenId === idAlmacenRestar);
      if (Number(almacenRestar?.stock) > stocRecibido) {
        var stockActualizado = Number(almacenRestar?.stock) - stocRecibido;

        const dataAlmacenRestar: IproductoAlmacenes = {
          almProId: Number(almacenRestar?.almProId),
          almacenId: idAlmacenRestar,
          productoId: Number(this.idRepuesto),
          stock: Number(stockActualizado)
        }
        //ACTUALIZAR EN LA BASE DE DATOS EL STOCK DEL ALMACEN RESTADO
        this.productosService.putAlmacenData(dataAlmacenRestar).subscribe(
          resp => {
            if (resp.exito === 1) {
            }
          }
        )
      } else {
        stockCompleto = false;
        alert('ERROR: La cantidad es menor que el Stock del almacén')
        this.loadData = false
        return
      }
    }

    if (!stockCompleto) { return }


    /*=================================================================
    Capturar la información del formulario del formulario en la interfaz
    ===================================================================*/

    const dataAlmacen: IproductoAlmacenes = {
      almProId: 0,
      almacenId: this.f.controls['almacenId'].value,
      productoId: Number(this.idRepuesto),
      stock: this.f.controls['stock'].value
    }


    /*===========================================
    Guardar información en la base de datos
    =========================================*/
    this.productosService.postAlmacenData(dataAlmacen).subscribe(
      resp => {
        if (resp.exito === 1) {

          if (this.transferencia) {
            /*========================
            Guardar la transferencia
            ==========================*/
            const dataTransferencia: IAuditoriaRepuestoTransaccion = {
              audId: 0,
              audFecha: new Date(),
              audIdProducto: this.idRepuesto,
              nombreProducto: "",
              audAlmacenOrigen: this.f.controls['almacenIdTransferencia'].value,
              nombreAlmacenOrigen: "",
              audAlmacenDestino: this.f.controls['almacenId'].value,
              nombreAlmacenDestino: "",
              audCantidadTransferida: this.f.controls['stock'].value,
              audUsuario: this.empleadoId,
              nombreUsuario: ""
            }

            this.audiTransaccionesRepService.postData(dataTransferencia).subscribe(
              res => {
                if (res.exito === 1) {
                  this.loadData = false;
                  this.dialogRef.close('save');
                  alerts.basicAlert('Ok', resp.mensaje, 'success');

                }
              }
            )
          } else {
            this.loadData = false;
            this.dialogRef.close('save');
            alerts.basicAlert('Ok', resp.mensaje, 'success');

          }
        } else {
          this.loadData = false;
          alerts.basicAlert('Ok', resp.mensaje, 'error');
          this.dialogRef.close();
        }
      }
    )
  }


  almacenDuplicado() {
    return (control: AbstractControl) => {
      const id = control.value;
      return new Promise((resolve) => {
        var idRepetido = false;
        this.almacenProducto.forEach(element => {
          if (element.almacenId == id) {
            idRepetido = true;
          }
        });
        if (idRepetido) {
          resolve({ idRepetido: true })
        }
        resolve(false)
      })
    }
  }



  transferenciaAlmacen(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const id = control.value;
      return new Promise((resolve) => {
        const idAlmacen = this.f.controls['almacenId'].value;

        if (id == idAlmacen) {
          resolve({ idRepetidoTrans: true })
        }
        resolve(null)
      })
    }
  }




}
