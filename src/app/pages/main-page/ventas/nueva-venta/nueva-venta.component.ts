import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { functions } from 'src/app/helpers/functions';
import { Iciudad } from 'src/app/interface/iciudad';
import { Icliente } from 'src/app/interface/icliente';
import { IdetalleVenta } from 'src/app/interface/idetalle-venta';
import { CiudadesService } from 'src/app/services/ciudades.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { DialogBuscarClienteComponent } from '../dialog-buscar-cliente/dialog-buscar-cliente.component';
import { iva, dialog } from 'src/app/enviroments/enviroments';
import { DialogBuscarRepuestoComponent } from '../dialog-buscar-repuesto/dialog-buscar-repuesto.component';
import { Iproducto } from 'src/app/interface/iproducto';
import { IproductoAlmacen } from 'src/app/interface/iproducto-almacen';
import { ProductosService } from 'src/app/services/productos.service';
import { AlmacenesService } from 'src/app/services/almacenes.service';
import { Ialmacen } from 'src/app/interface/ialmacen';
import { alerts } from 'src/app/helpers/alerts';
import { VentasService } from 'src/app/services/ventas.service';
import { Iventa } from 'src/app/interface/iventa';
import { ActivatedRoute, Router } from '@angular/router';
import { Icotizacion } from 'src/app/interface/icotizacion';
import { CotizacionesService } from 'src/app/services/cotizaciones.service';


@Component({
  selector: 'app-nueva-venta',
  templateUrl: './nueva-venta.component.html',
  styleUrls: ['./nueva-venta.component.css']
})
export class NuevaVentaComponent implements OnInit {


  /*=================
  Grupo de Controles
  ===================*/
  public f: FormGroup = this.form.group({
    identificacion: ['', [Validators.required, Validators.pattern('[0-9]*')]],
    cantidad: ['1', {
      validators: Validators.required,
      asyncValidators: this.validarCantidad(),
      updateOn: 'blur'
    }],
    precio: [{ value: 0, disabled: true }],
    descuento: [''],
    metodoPago: [2],
    efectivoRecibido: [],
  })

  /*===========================================
  Validación personalizada
  ===========================================*/
  get cantidad() { return this.f.get('cantidad') }
  get precio() { return this.f.get('precio') }
  get descuento() { return this.f.get('descuento') }
  get identificacion() { return this.f.get('identificacion') }
  get metodoPago() { return this.f.get('metodoPago') }
  get efectivoRecibido() { return this.f.get('efectivoRecibido') }



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
  Variable almacenar listados 
  ===========================================*/
  clienteListado: Icliente[] = [];
  almacenesListado: Ialmacen[] = [];



  /*===========================================
  Variable de datos de los clientes
  ===========================================*/
  idCliente!: number;
  nombre: string = '';
  direccion: string = '';

  /*===========================================
  Variable de datos repuesto seleccionado
  ===========================================*/
  idRep!: number;
  idAlmacenRep!: number;
  nombreRep: string = '';
  stockRep!: number;
  tarjeta: number = 0;
  efectivo: number = 0;
  ubicacionRepuesto!: string;

  /*===========================================
  Variables  para guardar la factura
  ===========================================*/
  fecha: Date = new Date();
  numeroFactura = 0;
  subtotal = 0;
  descuentoTotal = 0;
  porcentajeIva = iva.etiqueta;
  valorIva = 0;
  total = 0;
  estadoFac = 0;
  cambio = 0;
  idEmpleado = 0;

  /*===========================================
  Variable  para saber si se edita una cotizacion o factura
  ===========================================*/
  cotizacion = false;
  venta = false;

  /*===========================================
  Variable  para saber el almacen del usuarios
  ===========================================*/
  idAlmacenEmpleado = 0;

  /*===========================================
  Variable  para saber si puede modificar 
  ===========================================*/
  checkboxControl = new FormControl(false);

  /*===========================================
Variable  para logica de met. Pagos
===========================================*/
  selectTarjeta = true;
  auxPrecio = 0;

  constructor(private form: FormBuilder,
    private clientesService: ClientesService,
    private almacenesService: AlmacenesService,
    private ventasService: VentasService,
    private cotizacionesService: CotizacionesService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog) {

  }

  ngOnInit(): void {

    this.cargarListas();
    this.initForm();



    /*===============================
    Verificar si es venta o cotizacion
    ================================*/
    this.activatedRoute.params.subscribe(
      (params) => {

        if (params['tipo'] == 'venta') {
          this.venta = true;
          this.ventasService.getData().subscribe(
            resp => {
              this.numeroFactura = resp.data[0].facId + 1;
            }
          )
        } else {
          this.cotizacion = true;
          this.cotizacionesService.getData().subscribe(
            resp => {
              this.numeroFactura = resp.data[0].cotId + 1;
            }
          )
        }
      }
    )
    const usuario = JSON.parse(localStorage.getItem('usuario')!);
    this.idEmpleado = usuario.id;
    this.idAlmacenEmpleado = usuario.almacen;
  }


  /*===========================================
  Función para cargar listas
  ===========================================*/
  async cargarListas() {

    this.clientesService.getData().subscribe(
      resp => {
        this.clienteListado = resp.data;
        this.filterOptions = resp.data;
      }
    )
    this.almacenesListado = await functions.verificacionAlmacenes(this.almacenesService);

  }

  /*===========================================
  Función para guardar la venta
  ===========================================*/
  guardar() {

    alerts.confirmAlert("¿ Desea finalizar la factura ?", "", "question", "Si, guardar").then(
      (result) => {
        if (result.isConfirmed) {

          /*===================================================
          Mientras la informacion se guarda en la base de datos 
          ====================================================*/

          this.loadData = true

          /*====================================================
          Capturar la información del formulario en la Interfaz
          =====================================================*/
          this.detalle.forEach((element: any) => {
            element.detTotal = element.detTotal - element.delDescuento;
          });

          const dataVenta: Iventa = {

            facId: 0,
            facFecha: this.fecha,
            facSubtotal: this.subtotal,
            facDescuento: this.descuentoTotal,
            facIva: iva.etiqueta,
            facValorIva: this.valorIva,
            facTotal: this.total,
            facEstado: this.checkboxControl.value ? 1 : 0,
            facIdEmpleado: this.idEmpleado,
            facIdCliente: this.idCliente,
            facIdMetPago: this.f.controls['metodoPago'].value,
            detalles: this.detalle,
          }

          /*===========================================
          Guardar la informacion en base de datos
          =========================================*/
          this.ventasService.postData(dataVenta).subscribe(
            resp => {
              if (resp.exito === 1) {
                this.loadData = false;
                alerts.saveAlert('Ok', resp.mensaje, 'success').then(() => this.router.navigate(['/ventas']))
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



  /*=========================
Validacion formulario
==============================*/
  invalidField(field: string) {
    return functions.invalidField(field, this.f, this.formSubmitted)
  }


  /*======================
  Añadir detalle de venta
  ========================*/
  addDetalle() {

    /*====================================
    Validar que el formulario esta correcto 
    ======================================*/
    if (this.f.invalid || this.f.controls['cantidad'].value == ' ') {
      return;
    }

    //var precio = this.f.controls['precio'].value;
    var precio = 0;
    if (this.selectTarjeta) {
      precio = this.tarjeta
    } else {
      precio = this.efectivo
    }


    var cantidad = this.f.controls['cantidad'].value;

    /*====================================
    Validar que la cantidad a vender 
    ======================================*/
    var stockInsuficiente = false;
    if (this.detalle.length > 0) {
      this.detalle.forEach((element: IdetalleVenta, index: number) => {
        if (element.detIdProducto === this.idRep && element.detAlmacen === this.idAlmacenRep) {
          var auxCantidad = cantidad + element.detCantidad;
          if (this.stockRep < auxCantidad) {
            alerts.basicAlert('Stock Insuficiente', 'La cantidad total no esta disponible', 'error');
            stockInsuficiente = true;
          } else {
            cantidad += this.detalle[index].detCantidad;
            this.eliminarDetalle(index, this.detalle[index])

          }
        }

      });
    }

    if (stockInsuficiente) return

    var subTotal = cantidad * precio;
    var descuento = this.f.controls['descuento'].value;

    var valorDescuento = functions.aproximarDosDecimales(subTotal * (descuento / 100));
    this.total += subTotal - valorDescuento;
    this.descuentoTotal += valorDescuento;
    this.valorIva = functions.aproximarDosDecimales(this.total * iva.valor);
    this.subtotal = functions.aproximarDosDecimales(this.total - this.valorIva);

    const detalle: IdetalleVenta = ({
      detId: 0,
      detIdFactura: 0,
      detAlmacen: this.idAlmacenRep,
      detPrecio: precio,
      detCantidad: cantidad,
      detTotal: functions.aproximarDosDecimales(subTotal),
      detIdProducto: this.idRep,
      detEstado: 0,
      delDescuento: valorDescuento,
      repuesto: this.nombreRep,
      almacen: this.nombreIdAlmacen(this.idAlmacenRep),
      ubicacion: this.ubicacionRepuesto,
      precioTarjeta: this.tarjeta,
      precioEfectivo: this.efectivo
    } as IdetalleVenta)
    this.detalle.push(detalle);

    this.limpiarControles();


  }

  /*===========================================
  Función para elminar un detalle de la venta
  ===========================================*/
  eliminarDetalle(i: any, item: any) {
    var detalleTotal = item.detTotal - item.delDescuento;
    this.total -= detalleTotal;
    this.descuentoTotal -= item.delDescuento;
    this.valorIva = functions.aproximarDosDecimales(this.total * iva.valor);
    this.subtotal = functions.aproximarDosDecimales(this.total - this.valorIva);
    this.detalle.splice(i, 1);
  }

  /*===========================================
  Función limpieza de controles 
  ==========================================*/
  limpiarControles() {
    this.nombreRep = '';
    this.stockRep = 1;
    this.f.controls['cantidad'].setValue("1");
    (this.selectTarjeta) ? this.f.controls['precio'].setValue(this.tarjeta) : this.f.controls['precio'].setValue(this.efectivo);
  }


  /*====================================
  Funciones para autocompletar el nombre
  ====================================*/
  initForm() {
    this.f.get('identificacion')?.valueChanges.subscribe(resp => {
      this.filterData(resp);
    })
  }

  filterData(resp: any) {
    this.nombre = '';
    this.direccion = '';
    this.idCliente = 0;

    this.filterOptions = this.clienteListado.filter((cliente) => cliente.cliIdentificacion.includes(resp));
    if (this.filterOptions.length > 0) {
      this.nombre = this.filterOptions[0].cliNombres + ' ' + this.filterOptions[0].cliApellidos;
      this.direccion = this.filterOptions[0].cliDireccion;
      this.idCliente = this.filterOptions[0].cliId;
    }

    if (this.f.get('identificacion')?.value === '') {
      this.nombre = "";
      this.direccion = '';
      this.idCliente = 0;
    }
  }

  /*===========================================
  Función para abrir dialog Cliente
  ===========================================*/
  buscarCliente() {

    const dialogRef = this.dialog.open(DialogBuscarClienteComponent,
      {
        width: dialog.tamaño,

      });

    dialogRef.afterClosed().subscribe(res => {

      if (res != undefined) this.f.controls['identificacion'].setValue(res.cliIdentificacion);
    })

  }


  /*===========================================
  Función para abrir dialog Repuesto
  ===========================================*/
  buscarRepuesto() {

    const dialogRef = this.dialog.open(DialogBuscarRepuestoComponent,
      {
        width: dialog.tamaño,
        data: this.idAlmacenEmpleado
      });

    dialogRef.afterClosed().subscribe((res) => {
      if (res != undefined && res != '') {
        var detallesAlmacen = this.obtenerStockUbicacionPorIdAlmacen(res.repuesto.almacen, res.almacen);
        this.idAlmacenRep = res.almacen;
        this.idRep = res.repuesto.proId;
        this.nombreRep = this.asiganarNombreCompletoRepuesto(res.repuesto)
        this.stockRep = detallesAlmacen.stock;
        this.ubicacionRepuesto = res.repuesto.proCodPils;
        this.efectivo = res.repuesto.proPvpEfectivo;
        this.tarjeta = res.repuesto.proPvpTarjeta;


      }
    })

  }

  /*===========================================
  Función para dar el nombre  con marcas y modelos
  ===========================================*/
  asiganarNombreCompletoRepuesto(repuesto: Iproducto) {
    var nombreCompleto: string = '';
    nombreCompleto = repuesto.proNombre + ' ';
    if (repuesto.marcas.length > 0) {
      repuesto.marcas.forEach((element: any) => {
        nombreCompleto += element + ', ';
      });
    }
    repuesto.modelos.forEach((element: any, index: number) => {
      // Verificar si es el último elemento
      if (index === repuesto.modelos.length - 1) {
        nombreCompleto += element;
      } else {
        nombreCompleto += element + ', ';
      }
    });

    return nombreCompleto
  }

  /*===========================================
  Función para obtener información de los almacenes
  ===========================================*/

  obtenerStockUbicacionPorIdAlmacen(almacenes: IproductoAlmacen[], idAlmacen: number) {
    const almacenSeleccionado = almacenes.find(almacen => almacen.almacenId === idAlmacen);
    if (almacenSeleccionado) {
      return {
        stock: almacenSeleccionado.stock,
      };
    }
    return {
      stock: 0,
    };
  }

  /*===========================================
  Verificación de cantidad a vender 
  ===========================================*/
  validarCantidad() {
    return (control: AbstractControl) => {
      const valor = Number(control.value);
      return new Promise((resolve) => {

        if (valor > this.stockRep) {
          resolve({ stockBajo: true })
        }

        resolve(false)

      })

    }

  }

  /*===========================================
  Función para obtner el nombre del almacén
  ===========================================*/
  nombreIdAlmacen(id: number) { return this.almacenesListado.find(a => a.almId === id)?.almNombre; }


  /*===========================================
  Función para editar un detalle de la venta
  ===========================================*/
  editarDetalle(elemento: any, posicion: any) {

    this.idAlmacenRep = elemento.detAlmacen;
    this.idRep = elemento.detIdProducto;

    this.f.controls['cantidad'].setValue(elemento.detCantidad);
    //this.f.controls['precio'].setValue(elemento.detPrecio);
    this.f.controls['descuento'].setValue(elemento.delDescuento);


    // this.stockRep = this.obtenerStockPorIdAlmacen(elemento.repuesto.almacen, elemento.almacen);
    // this.efectivo = elemento.repuesto.proPvpEfectivo;
    // this.tarjeta = elemento.repuesto.proPvpTarjeta;
    // this.efectivoMayor = elemento.repuesto.proPvMayEfectivo;
    // this.tarjetaMayor = elemento.repuesto.proPvMayTarjeta;

  }

  /*===========================================
  Función para calculo del vuelto efectivo
  ===========================================*/
  calculoCambioEfectivo(a: any) {
    setTimeout(() => {
      if (a === null) {
        this.cambio = 0;
      } else {
        this.cambio = a - this.total;
      }
    }, 1500);
  }




  /*===========================================
  Función para guardar la cotización
  ===========================================*/
  cotizar() {

    alerts.confirmAlert("¿ Desea guardar como cotización ?", "", "question", "Si, guardar").then(
      (result) => {
        if (result.isConfirmed) {

          /*===================================================
          Mientras la informacion se guarda en la base de datos 
          ====================================================*/

          this.loadData = true

          /*====================================================
          Capturar la información del formulario en la Interfaz
          =====================================================*/

          this.detalle.forEach((element: any) => {
            element.detTotal = element.detTotal - element.delDescuento;
          });

          const dataCotizacion: Icotizacion = {

            cotId: 0,
            cotFecha: this.fecha,
            cotSubtotal: this.subtotal,
            cotDescuento: this.descuentoTotal,
            cotIva: iva.etiqueta,
            cotValorIva: this.valorIva,
            cotTotal: this.total,
            cotEstado: 1,
            cotIdCliente: this.idCliente,
            cotIdMetPago: this.f.controls['metodoPago'].value,
            detalles: this.detalle
          }

          /*===========================================
          Guardar la informacion en base de datos
          =========================================*/

          this.cotizacionesService.postData(dataCotizacion).subscribe(
            resp => {
              if (resp.exito === 1) {
                this.loadData = false;
                alerts.saveAlert('Ok', resp.mensaje, 'success').then(() => this.router.navigate(['/cotizacion']))

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


  optMetodoPago(a: any) {
    if (a == 1) {
      this.f.get('precio')?.setValue(this.efectivo);
      this.selectTarjeta = false;
      this.actualizarListado('E');

    } else {
      this.f.get('precio')?.setValue(this.tarjeta);
      this.selectTarjeta = true;
      this.actualizarListado('T')
    }

  }

  actualizarListado(opPagp: any) {
    if (this.detalle.length > 0) {

      //INICIALIZACION A CERO A LAS VARIBLES  GLOBALES 
      this.total = 0;

      //ACTUALIZACION DE VARUBLES DE DETALLES
      this.detalle.forEach((element: any, index: number) => {
        const auxdetPrecio = (opPagp === 'T') ? element.precioTarjeta : element.precioEfectivo;
        element.detPrecio = auxdetPrecio;
        element.detTotal = auxdetPrecio * element.detCantidad;

        //ACTUALIZACION DE VARIABLES GLOBALES 
        var subTotal = auxdetPrecio * element.detCantidad;
        this.total += subTotal;
      });

      this.valorIva = functions.aproximarDosDecimales(this.total * iva.valor);
      this.subtotal = functions.aproximarDosDecimales(this.total - this.valorIva);
      this.aplicaDescuento()

    }
  }

  eliminarDescuento() {
    this.f.controls['descuento'].setValue("");
    this.aplicaDescuento();


  }
  aplicaDescuento() {

    var descuento = this.f.controls['descuento'].value;

    if (descuento) {
      var valorDescuento = functions.aproximarDosDecimales(this.total * (descuento / 100));
      this.total = this.total - valorDescuento;
      this.descuentoTotal = valorDescuento;
      this.valorIva = functions.aproximarDosDecimales(this.total * iva.valor);
      this.subtotal = functions.aproximarDosDecimales(this.total - this.valorIva);
    } else {
      this.total = this.total + this.descuentoTotal;
      this.descuentoTotal = 0;
      this.valorIva = functions.aproximarDosDecimales(this.total * iva.valor);
      this.subtotal = functions.aproximarDosDecimales(this.total - this.valorIva);
    }

    this.detalle.forEach((element: any) => {

      var valorDescuento = functions.aproximarDosDecimales(element.detTotal * (descuento / 100));
      element.delDescuento = descuento ? valorDescuento : 0;
    });


  }
}


