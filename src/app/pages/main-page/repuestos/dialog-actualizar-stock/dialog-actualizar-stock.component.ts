import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlmacenesService } from 'src/app/services/almacenes.service';
import { ProductosService } from 'src/app/services/productos.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Ialmacen } from 'src/app/interface/ialmacen';
import { Iproducto } from 'src/app/interface/iproducto';
import { AudiTransaccionesRepService } from 'src/app/services/audi-transacciones-rep.service';
import { functions } from 'src/app/helpers/functions';


export interface IproductoAlmacenes {

  almProId: number,
  almacenId: number,
  productoId: number,
  stock: number,
  stockRecibido: number,
  almacenIdRestar: number,
  audUsuario: number
}

@Component({
  selector: 'app-dialog-actualizar-stock',
  templateUrl: './dialog-actualizar-stock.component.html',
  styleUrls: ['./dialog-actualizar-stock.component.css']
})
export class DialogActualizarStockComponent implements OnInit {

  /*=================
Grupo de Controles
===================*/
  public f: FormGroup = this.form.group({
    almacenIdTransferencia: ['', Validators.pattern('[0-9a-zA-Z]*')],
    stock: ['', Validators.required]
  })


  /*===========================================
  Validación personalizada
  ===========================================*/
  get almacenIdTransferencia() { return this.f.get('almacenIdTransferencia') }
  get stock() { return this.f.get('stock') }


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
  almacenProducto: IproductoAlmacenes[] = [];


  /*===========================================
  Variable  para saber si es transferencia de un local
  ===========================================*/
  checkboxControl = new FormControl(false);

  /*===========================================
  Variable  para saber si es transferencia de un local
  ===========================================*/
  producto!: Iproducto;


  /*===========================================
  Variable del id del  almacén ID
  ===========================================*/

  almacenId = 0;
  empleadoId = 0;
  transferencia = false;
  disponibleStockAlmacen = false;
  codigo = '';
  idRepuesto = 0;

  constructor(private form: FormBuilder,
    private almacenesService: AlmacenesService,
    private productosService: ProductosService,
    public dialogRef: MatDialogRef<DialogActualizarStockComponent>,
    @Inject(MAT_DIALOG_DATA) public product: Iproducto
  ) {

  }

  async ngOnInit(): Promise<void> {
    this.idRepuesto = this.product.proId;
    const usuario = JSON.parse(localStorage.getItem('usuario')!);
    this.almacenId = usuario.almacen;
    this.empleadoId = usuario.id;

    this.almacenes = await functions.verificacionAlmacenes(this.almacenesService);
    this.almacenes = this.almacenes.filter(item => item.almId != this.almacenId);

    this.almacenProducto = this.product.almacen
    this.producto = this.product;
    this.codigo = this.product.proCodPils;
  }




  async guardar() {
    /*===============================
    Validar que se envio el formulario 
    ================================*/

    this.formSubmitted = true;

    /*====================================
    Validar que el formulario esta correcto 
    ======================================*/

    if (this.f.invalid) {
      return;
    }


    /*===================================================
    Mientras la informacion se guarda en la base de datos 
    ====================================================*/

    this.loadData = true


    /*=================================================================
    Logica de negocio para saber si es transferencia de otro almacén 
    ===================================================================*/

    var almacen: any = this.almacenProducto.find((a) => a.almacenId === this.almacenId);

    var existeAlmacen = !!almacen;
    var transferencia = !!this.checkboxControl.value;
    const stocRecibido = this.f.controls['stock'].value;

    // Combinamos los valores booleanos en una sola cadena
    var combinacion = `${existeAlmacen}-${transferencia}`;

    switch (combinacion) {
      case 'true-true':
        // Lógica para cuando existeAlmacen es true y transferencia es true

        try {
          const idAlmacenRestar = this.f.controls['almacenIdTransferencia'].value;
          const almacenRestar: any = this.almacenProducto.find((a) => a.almacenId === idAlmacenRestar);
          if (this.validarCantidad(almacenRestar)) {
            var prodcutoAlmacen: IproductoAlmacenes =
            {
              almProId: 0,
              almacenId: this.almacenId,
              productoId: this.idRepuesto,
              stock: this.f.controls['stock'].value,
              stockRecibido: stocRecibido,
              almacenIdRestar: idAlmacenRestar,
              audUsuario: this.empleadoId,
            }
            this.productosService.transaccionProducto(1, prodcutoAlmacen).subscribe(res => {
              if (res.exito == 1) {
                this.loadData = false;
                this.dialogRef.close('save');
              }
            });
          }

        } catch (error) {
          console.log("error: ", error);

        }

        break;
      case 'true-false':
        // Lógica para cuando existeAlmacen es true y transferencia es false
        try {
          const actualizarAlmacen: IproductoAlmacenes = {
            almProId: almacen.almProId,
            almacenId: almacen.almacenId,
            productoId: almacen.productoId,
            stock: almacen.stock + stocRecibido,
            stockRecibido: stocRecibido,
            almacenIdRestar: 0,
            audUsuario: this.empleadoId,
          }
          this.productosService.transaccionProducto(2, actualizarAlmacen).subscribe(
            resp => {
              if (resp.exito == 1) {
                this.loadData = false;
                this.dialogRef.close('save');
              }
            }
          )
        } catch (error) {
          console.log("error: ", error);
        }

        break;
      case 'false-true':
        // Lógica para cuando existeAlmacen es false y transferencia es true
        try {
          const idAlmacenRestar2 = this.f.controls['almacenIdTransferencia'].value;
          const almacenRestar2: any = this.almacenProducto.find((a) => a.almacenId === idAlmacenRestar2);
          if (this.validarCantidad(almacenRestar2)) {

            var prodcutoAlmacen: IproductoAlmacenes =
            {
              almProId: 0,
              almacenId: this.almacenId,
              productoId: this.idRepuesto,
              stock: this.f.controls['stock'].value,
              stockRecibido: stocRecibido,
              almacenIdRestar: idAlmacenRestar2,
              audUsuario: this.empleadoId,
            }
            this.productosService.transaccionProducto(3, prodcutoAlmacen).subscribe(
              resp => {
                if (resp.exito = 1) {
                  this.loadData = false;
                  this.dialogRef.close('save');
                }
                this.loadData = false;
              })
          }


        } catch (error) {
          console.log("error: ", error);

        }

        break;
      case 'false-false':
        // Lógica para cuando existeAlmacen es false y transferencia es false
        try {
          var prodcutoAlmacen: IproductoAlmacenes =
          {
            almProId: 0,
            almacenId: this.almacenId,
            productoId: this.idRepuesto,
            stock: this.f.controls['stock'].value,
            stockRecibido: stocRecibido,
            almacenIdRestar: 0,
            audUsuario: this.empleadoId,
          }
          this.productosService.transaccionProducto(4, prodcutoAlmacen).subscribe(
            resp => {
              if (resp.exito == 1) {
                this.loadData = false;
                this.dialogRef.close('save');
              }
            })
        } catch (error) {
          console.log("error: ", error);
        }

        break;
      default:
        // Lógica por defecto si ninguna combinación coincide
        console.log("Combinación desconocida.");
        break;
    }
  }


  validarCantidad(almacenRestar: any): any {
    const stocRecibido = this.f.controls['stock'].value;
    if (Number(almacenRestar?.stock) >= stocRecibido) {
      return true
    } else {
      alert('ERROR: La cantidad es menor que el Stock del almacén')
      this.loadData = false
      return false;
    }
  }

}
