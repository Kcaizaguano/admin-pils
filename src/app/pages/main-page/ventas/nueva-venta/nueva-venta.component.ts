import { Component, OnInit , Input } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { functions } from 'src/app/helpers/functions';
import { Iciudad } from 'src/app/interface/iciudad';
import { Icliente } from 'src/app/interface/icliente';
import { IdetalleVenta } from 'src/app/interface/idetalle-venta';
import { CiudadesService } from 'src/app/services/ciudades.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { DialogBuscarClienteComponent } from '../dialog-buscar-cliente/dialog-buscar-cliente.component';
import { dialog } from 'src/app/enviroments/enviroments';
import { DialogBuscarRepuestoComponent } from '../dialog-buscar-repuesto/dialog-buscar-repuesto.component';
import { Iproducto } from 'src/app/interface/iproducto';
import { IproductoAlmacen } from 'src/app/interface/iproducto-almacen';
import { ProductosService } from 'src/app/services/productos.service';
import { AlmacenesService } from 'src/app/services/almacenes.service';
import { Ialmacen } from 'src/app/interface/ialmacen';
import { alerts } from 'src/app/helpers/alerts';
import { VentasService } from 'src/app/services/ventas.service';
import { Iventa } from 'src/app/interface/iventa';
import { Router } from '@angular/router';
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
    cantidad: ['', {
      validators: Validators.required,
      asyncValidators: this.validarCantidad(),
      updateOn: 'blur'
    }],
    precio: ['', [Validators.required]],
    descuento: [''],
    metodoPago: [1],
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
  ciudadListado: Iciudad[] = [];
  repuestosListado: Iproducto[] = [];
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
  efectivo!: number;
  tarjeta!: number;
  ubicacionRepuesto!: string;

  /*===========================================
  Variables  para guardar la factura
  ===========================================*/
  fecha: Date = new Date();
  numeroFactura = 0;
  subtotal = 0;
  descuentoTotal = 0;
  porcentajeIva = 12;
  valorIva = 0;
  total = 0;
  estadoFac = 0;
  cambio = 0;


  constructor(private form: FormBuilder,
    private clientesService: ClientesService,
    private ciudadesService: CiudadesService,
    private productosService: ProductosService,
    private almacenesService: AlmacenesService,
    private ventasService: VentasService,
    private cotizacionesService:CotizacionesService,
    private router: Router,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.cargarListas();
    this.initForm();
  }


  /*===========================================
  Función para cargar listas
  ===========================================*/
  cargarListas() {

    this.clientesService.getData().subscribe(
      resp => {
        this.clienteListado = resp.data;
        this.filterOptions = resp.data;
      }
    )

    this.ciudadesService.getData().subscribe(
      resp => {
        this.ciudadListado = resp.data;
      }
    )

    this.productosService.getData().subscribe(
      resp => {
        this.repuestosListado = resp.data;
      }
    )

    this.almacenesService.getData().subscribe(
      resp => {
        this.almacenesListado = resp.data;
      }
    )

    this.ventasService.getData().subscribe(
      resp => {

        this.numeroFactura = resp.data[0].facId + 1;

      }

    )
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

          const dataVenta: Iventa = {

            facId: 0,
            facFecha: this.fecha,
            facSubtotal: this.subtotal,
            facDescuento: this.descuentoTotal,
            facIva: 12,
            facValorIva: this.valorIva,
            facTotal: this.total,
            facEstado: 1,
            facIdEmpleado: 3,
            facIdCliente: this.idCliente,
            facIdMetPago: this.f.controls['metodoPago'].value,
            detalles: this.detalle
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
    if (this.f.invalid || this.f.controls['precio'].value == ' ' || this.f.controls['cantidad'].value == ' ') {
      return;
    }

    var precio = this.f.controls['precio'].value;
    var cantidad = this.f.controls['cantidad'].value;
    var descuento = this.f.controls['descuento'].value;

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
    var valorDescuento = functions.aproximarDosDecimales(subTotal * (descuento / 100));
    this.total += subTotal - valorDescuento;
    this.descuentoTotal += valorDescuento;
    this.valorIva = functions.aproximarDosDecimales(this.total * 0.12);
    this.subtotal = functions.aproximarDosDecimales(this.total - this.valorIva);

    const detalle: IdetalleVenta = ({
      detIdVenta:0,
      detAlmacen: this.idAlmacenRep,
      detPrecio: precio,
      detCantidad: cantidad,
      detTotal: functions.aproximarDosDecimales(subTotal - valorDescuento),
      detIdProducto: this.idRep,
      detEstado: 0,
      delDescuento: valorDescuento,
      repuesto: this.nombreRep,
      almacen: this.nombreIdAlmacen(this.idAlmacenRep),
      ubicacion: this.ubicacionRepuesto
    } as IdetalleVenta)
    this.detalle.push(detalle);

    this.limpiarControles();

  }

  /*===========================================
  Función para elminar un detalle de la venta
  ===========================================*/
  eliminarDetalle(i: any, item: any) {
    this.total -= item.detTotal;
    this.descuentoTotal -= item.delDescuento;
    this.valorIva = functions.aproximarDosDecimales(this.total * 0.12);
    this.subtotal = functions.aproximarDosDecimales(this.total - this.valorIva);
    this.detalle.splice(i, 1);
  }

  /*===========================================
  Función limpieza de controles 
  ==========================================*/
  limpiarControles() {
    this.nombreRep = '';
    this.stockRep = 0;
    this.f.controls['cantidad'].setValue(" ");
    this.f.controls['precio'].setValue(" ");
    this.f.controls['descuento'].setValue("");
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
      const ciudad = this.ciudadListado.find(c => c.ciuId === this.filterOptions[0].cliIdCiudad)?.ciuNombre;
      this.direccion = this.filterOptions[0].cliDireccion + ' - ' + ciudad;
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
        data: 1
      });

    dialogRef.afterClosed().subscribe((res) => {
      if (res != undefined && res != '' ) {
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

          const dataCotizacion: Icotizacion = {

            cotId: 0,
            cotFecha: this.fecha,
            cotSubtotal: this.subtotal,
            cotDescuento: this.descuentoTotal,
            cotIva: 12,
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


}


