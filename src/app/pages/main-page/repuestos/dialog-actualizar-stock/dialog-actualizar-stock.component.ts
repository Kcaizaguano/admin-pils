import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlmacenesService } from 'src/app/services/almacenes.service';
import { ProductosService } from 'src/app/services/productos.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Ialmacen } from 'src/app/interface/ialmacen';
import { Iproducto } from 'src/app/interface/iproducto';
import { AudiTransaccionesRepService } from 'src/app/services/audi-transacciones-rep.service';
import { IAuditoriaRepuestoTransaccion } from 'src/app/interface/i-auditoria-repuesto-transaccion';
import { retry } from 'rxjs';
import { firstValueFrom } from 'rxjs';


export interface IproductoAlmacenes {

  almProId: number,
  almacenId: number,
  productoId: number,
  stock: number
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


  constructor(private form: FormBuilder,
    private almacenesService: AlmacenesService,
    private productosService: ProductosService,
    private audiTransaccionesRepService: AudiTransaccionesRepService,
    public dialogRef: MatDialogRef<DialogActualizarStockComponent>,
    @Inject(MAT_DIALOG_DATA) public idRepuesto: any
  ) {

  }

  ngOnInit(): void {


    const usuario = JSON.parse(localStorage.getItem('usuario')!);
    this.almacenId = usuario.almacen;
    this.empleadoId = usuario.id;



    this.almacenesService.getData().subscribe(
      resp => {
        this.almacenes = resp.data;
        this.almacenes = this.almacenes.filter(item => item.almId != this.almacenId);

      }
    )

    this.productosService.getItem(this.idRepuesto).subscribe(
      resp => {
        this.almacenProducto = resp.data.almacen
        this.producto = resp.data;
        this.codigo = this.producto.proCodPils;
      }
    )


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
    console.log("almacen: ", almacen);

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
            almacenRestar.stock = almacenRestar.stock - stocRecibido;
            this.buscarYReemplazar(almacenRestar)
            almacen.stock += stocRecibido;
            this.buscarYReemplazar(almacen)
            await this.registroTransferencia()
            await this.actualizarProducto();
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
            stock: almacen.stock + stocRecibido
          }
          this.buscarYReemplazar(actualizarAlmacen)
          await this.actualizarProducto();

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
              stock: this.f.controls['stock'].value
            }

            this.productosService.postAlmacenData(prodcutoAlmacen).subscribe(
              res => {
                if (res.exito === 1) {
                  this.productosService.getItem(this.idRepuesto).subscribe(
                    res2 => {
                      if (res2.exito === 1) {
                        this.almacenProducto = res2.data.almacen;
                        almacenRestar2.stock = almacenRestar2.stock- stocRecibido;
                        this.buscarYReemplazar(almacenRestar2);
                        this.registroTransferencia();
                        this.actualizarProducto();
                      }
                    }
                  )
                }
              }
            )
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
            stock: this.f.controls['stock'].value
          }

          this.productosService.postAlmacenData(prodcutoAlmacen).subscribe(
            res => {
              if (res.exito === 1) {
                this.productosService.getItem(this.idRepuesto).subscribe(
                  res2 => {
                    this.productosService.putData(res2.data).subscribe(
                      res3 => {
                        if (res3.exito === 1) {
                          setTimeout(() => {
                            this.loadData = false;
                            this.dialogRef.close('save');
                          }, 2000);
                        }
                      }
                    )
                  }
                )
              }
            }
          )

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



  async actualizarProducto() {


    /*=================================================================
    Capturar la información del producto en la interfaz
    ===================================================================*/

    const dataProducto: Iproducto = {

      proId: this.idRepuesto,
      proNumParte: this.producto.proNumParte,
      proNombre: this.producto.proNombre,
      proPrecioCompra: this.producto.proPrecioCompra,
      proPvpEfectivo: this.producto.proPvpEfectivo,
      proPvpTarjeta: this.producto.proPvpTarjeta,
      proDescripcion: this.producto.proDescripcion,
      proPresentacion: this.producto.proPresentacion,
      proUrlImagen: this.producto.proUrlImagen,
      proEstado: this.producto.proEstado,
      proStockTotal: 0,
      proProvId: this.producto.proProvId,
      proStockMinimo: this.producto.proStockMinimo,
      proCodPils: this.producto.proCodPils,
      marcas: this.producto.marcas,
      modelos: this.producto.modelos,
      almacen: this.almacenProducto
    }

    this.productosService.putData(dataProducto).subscribe(
      resp => {
        if (resp.exito === 1) {
          this.loadData = false;
          this.dialogRef.close('save');
        } else {
          this.loadData = false;
        }
      }
    )
  }



  registrarAlmacenNuevo(): any {
    var prodcutoAlmacen: IproductoAlmacenes =
    {
      almProId: 0,
      almacenId: this.almacenId,
      productoId: this.idRepuesto,
      stock: this.f.controls['stock'].value
    }

    this.productosService.postAlmacenData(prodcutoAlmacen).subscribe(
      res => {
        if (res.exito === 1) { return true }
        return false
      }
    )

  }


  async actualizarProductoPorID() {
    try {
      const res1 = await this.productosService.getItem(this.idRepuesto).toPromise();
      const res2 = await this.productosService.putData(res1?.data).toPromise();
      return res2?.exito === 1;
    } catch (error) {
      console.error(error);
      return false;
    }
  }





  async registroTransferencia() {

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
      audAlmacenDestino: this.almacenId,
      nombreAlmacenDestino: "",
      audCantidadTransferida: this.f.controls['stock'].value,
      audUsuario: this.empleadoId,
      nombreUsuario: ""
    }
    this.audiTransaccionesRepService.postData(dataTransferencia).subscribe(
      res => {
        if (res.exito === 1) { return true } else { return false }
      }
    )

  }


  buscarYReemplazar(data: IproductoAlmacenes) {
    this.almacenProducto.forEach((element: IproductoAlmacenes, index: number) => {
      if (element.almProId === data.almProId) {
        this.almacenProducto[index] = data;
      }
    });
  }
}
