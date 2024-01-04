import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { dialog } from 'src/app/enviroments/enviroments';
import { functions } from 'src/app/helpers/functions';
import { Iproveedor } from 'src/app/interface/iproveedor';
import { ComprasService } from 'src/app/services/compras.service';
import { ProveedoresService } from 'src/app/services/proveedores.service';
import { DialogBuscarRepuestoComponent } from '../../ventas/dialog-buscar-repuesto/dialog-buscar-repuesto.component';
import { Iproducto } from 'src/app/interface/iproducto';
import { IdetalleCompra } from 'src/app/interface/idetalle-compra';
import { alerts } from 'src/app/helpers/alerts';
import { Icompra } from 'src/app/interface/icompra';
import { ProductosService } from 'src/app/services/productos.service';

@Component({
  selector: 'app-nueva-compra',
  templateUrl: './nueva-compra.component.html',
  styleUrls: ['./nueva-compra.component.css']
})
export class NuevaCompraComponent implements OnInit {

  /*=================
  Grupo de Controles
  ===================*/
  public f: FormGroup = this.form.group({

    orden: ['', [Validators.required, Validators.pattern('[0-9a-zA-ZáéíóúñÁÉÍÓÚÑ\\-\\/\\(\\)]*')]],
    proveedor: ['', [Validators.required]],
    descripcion: [''],
    precioCompra: ['', [Validators.required]],
    precioVenta: ['', [Validators.required]],
    cantidad: ['', [Validators.required]],

  })


  /*===========================================
  Validación personalizada
  ===========================================*/
  get orden() { return this.f.get('orden') }
  get proveedor() { return this.f.get('proveedor') }
  get descripcion() { return this.f.get('descripcion') }
  get cantidad() { return this.f.get('cantidad') }
  get precioCompra() { return this.f.get('precioCompra') }
  get precioVenta() { return this.f.get('precioVenta') }



  /*===========================================
  Variable que valida el envío del formulario
    ===========================================*/

  formSubmitted = false;

  /*===========================================
  Variable de precarga
  ===========================================*/

  loadData = false;

  /*===========================================
  Lista de detalles de la venta
  ===========================================*/

  detalle: any[] = [];


  /*===========================================
  Variable para autocompletado del nombre de repuestos
  ===========================================*/

  filterOptions: any[] = [];

  /*===========================================
  Variables  para guardar la compra
  ===========================================*/
  fecha: Date = new Date();
  numeroCompra = 0;
  total = 0;
  id = 0;
  editar = false;

  /*===========================================
  Lista de proveedores
  ===========================================*/
  proveedores: Iproveedor[] = [];
  lstProductos: Iproducto[] = [];
  

  /*===========================================
  Variables de repuesto seleccinoado
  ===========================================*/
  nombreRep: string = '';
  idRep = 0;
  ubicacionRepuesto: any;
  efectivo: any;
  idAlmacenEmpleado: any;



  constructor(private form: FormBuilder,
    private comprasService: ComprasService,
    private proveedoresService: ProveedoresService,
    private productosService: ProductosService,
    public dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {

    this.productosService.getData().subscribe(
      res => {
        this.lstProductos = res.data;
      }
    )

    /*===============================
    Verificar si es nuevo o editar
    ================================*/
    this.activatedRoute.params.subscribe(
      (params) => {
        this.id = params['id'];
        if (this.id != 0) {
          this.editar = true;
          this.cargarCompra(this.id.toString());
        }
      }
    )

    this.proveedoresService.getData().subscribe(
      resp => {
        this.proveedores = resp.data;
      }
    )

    if (!this.editar) {
      this.comprasService.getData().subscribe(
        res => {

          this.numeroCompra = res.data[0].comId +1;
        }
      )
      
    }



  }

  /*=========================
  Validacion formulario
  ==============================*/
  invalidField(field: string) {
    return functions.invalidField(field, this.f, this.formSubmitted)
  }

  /*===========================================
  Función para actualizar una compra
  ===========================================*/
  cargarCompra(id: string) {
    this.comprasService.getItem(id).subscribe(
      resp => {
        this.numeroCompra = resp.data.comId;
        this.fecha = resp.data.comFecha;
        this.f.controls['orden'].setValue(resp.data.comNumOrden);
        this.f.controls['proveedor'].setValue(resp.data.comProveedor);
        this.f.controls['descripcion'].setValue(resp.data.comDescripcion);
        this.total = resp.data.comTotal;
        resp.data.detalles.forEach((element: any) => {
          const detalle: IdetalleCompra = ({
            detId: element.detId,
            detIdProducto: element.detIdProducto,
            detPreCompra: element.detPreCompra,
            detPreVenta: element.detPreVenta,
            detCantidad: element.detCantidad,
            detTotal: element.detTotal,
            detIdCompra: element.detIdCompra,
            nombreProducto: element.nombreProducto,
            ubicacion:this.lstProductos.find(l => l.proId === element.detIdProducto )?.proCodPils,

          } as IdetalleCompra)

          this.detalle.push(detalle);
        });


      }
    )
  }


  /*===========================================
  Función para abrir dialog Repuesto
  ===========================================*/
  buscarRepuesto() {

    const dialogRef = this.dialog.open(DialogBuscarRepuestoComponent,
      {
        width: dialog.tamaño,
        data: 1
      });

    dialogRef.afterClosed().subscribe((res) => {

      if (res != undefined && res != '') {
        this.idRep = res.repuesto.proId;
        this.nombreRep = this.asignarNombreCompletoRepuesto(res.repuesto)
        this.ubicacionRepuesto = res.repuesto.proCodPils;
        this.efectivo = res.repuesto.proPvpEfectivo;
        this.f.controls['precioCompra'].setValue(res.repuesto.proPrecioCompra);
        this.f.controls['precioVenta'].setValue(res.repuesto.proPvpEfectivo);

      }
    })
  }


  /*===========================================
  Función para dar el nombre  con marcas y modelos
  ===========================================*/
  asignarNombreCompletoRepuesto(repuesto: Iproducto) {
    var nombreCompleto: string = '';
    nombreCompleto = repuesto.proNombre + ' ';
    if (repuesto.marcas.length > 0) {
      repuesto.marcas.forEach((element: any) => {
        nombreCompleto += element + ', ';
      });
    }

    if (repuesto.modelos.length > 0) {
      repuesto.modelos.forEach((element: any, index: number) => {
        // Verificar si es el último elemento
        if (index === repuesto.modelos.length - 1) {
          nombreCompleto += element;
        } else {
          nombreCompleto += element + ', ';
        }
      });
    }

    return nombreCompleto
  }


  /*===========================================
  Función limpieza de controles 
  ==========================================*/
  limpiarControles() {
    this.nombreRep = '';
    this.f.controls['cantidad'].setValue(" ");
    this.f.controls['precioCompra'].setValue(" ");
    this.f.controls['precioVenta'].setValue(" ");
  }

  /*===========================================
Función para elminar un detalle de la venta
===========================================*/
eliminarDetalleMensaje(i: any, item: any){

  alerts.confirmAlert("¿ Desea eliminar el detalle ?", "", "question", "Si, eliminar").then(
    result =>{
      if (result.isConfirmed){
        this.eliminarDetalle(i,item)

      }
    }
  )

}


  eliminarDetalle(i: any, item: any) {

    this.total -= item.detTotal;
    this.detalle.splice(i, 1);


  }


  /*======================
  Añadir detalle de venta
  ========================*/
  addDetalle() {

    /*====================================
    Validar que el formulario esta correcto 
    ======================================*/
    if (this.f.invalid || 
      this.f.controls['precioCompra'].value == ' ' || 
      this.f.controls['cantidad'].value == ' ' || 
      this.f.controls['precioVenta'].value == ' ' || 
      this.nombreRep == "") {
      return;
    }


    var precioCompra = this.f.controls['precioCompra'].value;
    var cantidad = this.f.controls['cantidad'].value;


    /*====================================
    Actualizacion de cantidad al añadir
    ======================================*/
    if (this.detalle.length > 0) {
      this.detalle.forEach((element: IdetalleCompra, index: number) => {
        if (element.detIdProducto === this.idRep ) {
          cantidad += this.detalle[index].detCantidad;
          this.eliminarDetalle(index, this.detalle[index])
        }
      })

    }

    var subTotal = cantidad * precioCompra;
    this.total += subTotal;


    const detalle: IdetalleCompra = ({
      detId: 0,
      detIdProducto: this.idRep,
      detPreCompra: precioCompra,
      detPreVenta: this.f.controls['precioVenta'].value,
      detCantidad: cantidad,
      detTotal: subTotal,
      detIdCompra: 0,
      nombreProducto: this.nombreRep,
      ubicacion: this.ubicacionRepuesto
    } as IdetalleCompra)

    this.detalle.push(detalle);

    this.limpiarControles();

  }

  /*===========================================
Función para elminar un detalle de la venta
===========================================*/
  editarDetalle(i: any, item: any) {
    this. idRep = item.detIdProducto;
    this.nombreRep = item.nombreProducto;
    this.f.controls['cantidad'].setValue(item.detCantidad);
    this.f.controls['precioCompra'].setValue(item.detPreCompra);
    this.f.controls['precioVenta'].setValue(item.detPreVenta);
    this.ubicacionRepuesto = item.ubicacion;
    this.total -= item.detTotal;
    this.detalle.splice(i, 1);
  }

  /*===========================================
  Función para guardar en la base de datos
  ===========================================*/
  guardar() {
    this.editar ? this.actualizarCompra() : this.nuevaComrpra()
  }

  nuevaComrpra(){
        
    alerts.confirmAlert("¿ Desea finalizar la compra ?", "", "question", "Si, guardar").then(
      (result) => {
        if (result.isConfirmed) {

          /*====================================================
          Capturar la información del formulario en la Interfaz
          =====================================================*/

          const dataCompra: Icompra = {
            comId:0,
            comNumOrden: this.f.controls['orden'].value,
            comFecha: this.fecha,
            comProveedor: this.f.controls['proveedor'].value,
            comDescripcion: this.f.controls['descripcion'].value,
            comTotal: this.total,
            detalles: this.detalle,
            nombreProveedor:""
          }

          /*===========================================
          Guardar la informacion en base de datos
          =========================================*/

          this.comprasService.postData(dataCompra).subscribe(
            resp => {
              if (resp.exito === 1) {
                this.loadData = false;
                alerts.saveAlert('Ok', resp.mensaje, 'success').then(() => this.router.navigate(['/compras']))
              } else {
                this.loadData = false;
                alerts.basicAlert('Error Servidor', resp.mensaje, 'error');
              }
            }
          )

        }
      }
    )

  }

  actualizarCompra(){

    alerts.confirmAlert("¿ Desea guardar la compra ?", "", "question", "Si, guardar").then(
      (result) => {
        if (result.isConfirmed) {

          /*====================================================
          Capturar la información del formulario en la Interfaz
          =====================================================*/

          const dataCompra: Icompra = {
            comId:this.numeroCompra,
            comNumOrden: this.f.controls['orden'].value,
            comFecha: this.fecha,
            comProveedor: this.f.controls['proveedor'].value,
            comDescripcion: this.f.controls['descripcion'].value,
            comTotal: this.total,
            detalles: this.detalle,
            nombreProveedor:""
          }

          console.log("dataCompra: ", dataCompra);

          /*===========================================
          Guardar la informacion en base de datos
          =========================================*/

          this.comprasService.putData(dataCompra).subscribe(
            resp => {
              if (resp.exito === 1) {
                this.loadData = false;
                alerts.saveAlert('Ok', resp.mensaje, 'success').then(() => this.router.navigate(['/compras']))
              } else {
                this.loadData = false;
                alerts.basicAlert('Error Servidor', resp.mensaje, 'error');
              }
            }
          )

        }
      }
    )

  }

}
