import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlmacenesService } from 'src/app/services/almacenes.service';
import { ProductosService } from 'src/app/services/productos.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Ialmacen } from 'src/app/interface/ialmacen';
import { Iproducto } from 'src/app/interface/iproducto';

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



  constructor(private form: FormBuilder,
    private almacenesService: AlmacenesService,
    private productosService: ProductosService,
    public dialogRef: MatDialogRef<DialogActualizarStockComponent>,
    @Inject(MAT_DIALOG_DATA) public idRepuesto: any
  ) { }

  ngOnInit(): void {

    
    const usuario = JSON.parse(localStorage.getItem('usuario')!);
    this.almacenId = usuario.almacen;

    this.almacenesService.getData().subscribe(
      resp => {
        this.almacenes = resp.data;
        this.almacenes =  this.almacenes.filter(item => item.almId != this.almacenId);

      }
    )

    this.productosService.getItem(this.idRepuesto).subscribe(
      resp => {
        this.almacenProducto = resp.data.almacen
        this.producto = resp.data;
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


    const almacen = this.almacenProducto.find((a) => a.almacenId === this.almacenId);
    const stocRecibido = this.f.controls['stock'].value;

    var nuevoStock = stocRecibido + almacen?.stock;

    if (this.checkboxControl.value) {

      const idAlmacenRestar = this.f.controls['almacenIdTransferencia'].value;
      const almacenRestar = this.almacenProducto.find((a) => a.almacenId === idAlmacenRestar);
      if ( Number (almacenRestar?.stock)  >= stocRecibido) {
        var stockActualizado = Number(almacenRestar?.stock) - stocRecibido;

        const dataAlmacenRestar: IproductoAlmacenes = {
          almProId: Number(almacenRestar?.almProId),
          almacenId: idAlmacenRestar,
          productoId: Number(this.idRepuesto),
          stock: Number(stockActualizado)
        }
  
        this.buscarYReemplazar(dataAlmacenRestar)
      }else{
        stockCompleto =  false;
        alert('ERROR: La cantidad es menor que el Stock del almacén')
        this.loadData = false
        return
      }
 

    }

   if (!stockCompleto) { return}

    /*=================================================================
    Capturar la información del formulario del formulario en la interfaz
    ===================================================================*/
    var dataAlmacen: IproductoAlmacenes = {
      almProId: Number(almacen?.almProId),
      almacenId: this.almacenId,
      productoId: Number(this.idRepuesto),
      stock: Number(nuevoStock)
    }

    this.buscarYReemplazar(dataAlmacen)


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


    /*===========================================
    Guardar la informacion en base de datos
    =========================================*/

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


  buscarYReemplazar(data: IproductoAlmacenes) {
    this.almacenProducto.forEach((element: IproductoAlmacenes, index: number) => {
      if (element.almProId === data.almProId) {
        this.almacenProducto[index] = data;
      }
    });
  }
}
