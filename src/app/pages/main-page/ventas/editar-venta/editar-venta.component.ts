import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { alerts } from 'src/app/helpers/alerts';
import { functions } from 'src/app/helpers/functions';
import { Ialmacen } from 'src/app/interface/ialmacen';
import { Iciudad } from 'src/app/interface/iciudad';
import { Icliente } from 'src/app/interface/icliente';
import { IdetalleVenta } from 'src/app/interface/idetalle-venta';
import { Iproducto } from 'src/app/interface/iproducto';
import { Iventa } from 'src/app/interface/iventa';
import { AlmacenesService } from 'src/app/services/almacenes.service';
import { CiudadesService } from 'src/app/services/ciudades.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { CotizacionesService } from 'src/app/services/cotizaciones.service';
import { ProductosService } from 'src/app/services/productos.service';
import { VentasService } from 'src/app/services/ventas.service';
import { DialogBuscarClienteComponent } from '../dialog-buscar-cliente/dialog-buscar-cliente.component';
import { iva, dialog } from 'src/app/enviroments/enviroments';
import { DialogBuscarRepuestoComponent } from '../dialog-buscar-repuesto/dialog-buscar-repuesto.component';
import { IproductoAlmacen } from 'src/app/interface/iproducto-almacen';
import { Icotizacion } from 'src/app/interface/icotizacion';
import { MarcasService } from 'src/app/services/marcas.service';
import { ModelosService } from 'src/app/services/modelos.service';
import { Imarca } from 'src/app/interface/imarca';
import { Imodelo } from 'src/app/interface/imodelo';

@Component({
  selector: 'app-editar-venta',
  templateUrl: './editar-venta.component.html',
  styleUrls: ['./editar-venta.component.css']
})
export class EditarVentaComponent implements OnInit {


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
  detalleNoDisponible: any[] = [];


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
  marcasListado: Imarca[] = [];
  modelosListado: Imodelo[] = [];


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
  precioFinal = 0;

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
  empleadoId = 0;

  id = 0;

  /*===========================================
Variable  para saber el almacen del usuarios
===========================================*/
  idAlmacenEmpleado = 0;

  /*===========================================
  Variable  para saber si puede modificar 
  ===========================================*/
  checkboxControl = new FormControl(false);


  constructor(private form: FormBuilder,
    private clientesService: ClientesService,
    private ciudadesService: CiudadesService,
    private productosService: ProductosService,
    private almacenesService: AlmacenesService,
    private ventasService: VentasService,
    private marcasService: MarcasService,
    private modelosService: ModelosService,
    private cotizacionesService: CotizacionesService,
    private router: Router,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute) {

  }


  ngOnInit(): void {


    this.cargarListas();
    this.initForm();


    /*===============================
    Verificar si es venta o cotizacion
    ================================*/
    this.activatedRoute.params.subscribe(
      (params) => {

        this.id = params['id'];
        this.cargarCotizacion(this.id.toString());
      }
    )

    const usuario = JSON.parse(localStorage.getItem('usuario')!);
    this.idAlmacenEmpleado = usuario.almacen;
    this.empleadoId = usuario.id;
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

        

        this.numeroFactura = resp.data[0]?.facId + 1;

      }
    )

    this.marcasService.getData().subscribe(
      resp => {

        this.marcasListado = resp.data;
      }
    )

    this.modelosService.getData().subscribe(
      resp => {
        this.modelosListado = resp.data;
      }
    )


  }

  /*===========================================
  Función para guardar en la base de datos
  ===========================================*/
  guardar() {
    this.actualizarCotizacion()
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
    this.valorIva = functions.aproximarDosDecimales(this.total * iva.valor);
    this.subtotal = functions.aproximarDosDecimales(this.total - this.valorIva);

    const detalle: IdetalleVenta = ({
      detId: 0,
      detIdFactura: this.numeroFactura,
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
    this.valorIva = functions.aproximarDosDecimales(this.total * iva.valor);
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
      this.nombre = this.filterOptions[0].cliApellidos + ' ' + this.filterOptions[0].cliNombres;
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
        data: this.idAlmacenEmpleado
      });

    dialogRef.afterClosed().subscribe((res) => {
      if (res != undefined && res != '') {
        var detallesAlmacen = this.obtenerStockUbicacionPorIdAlmacen(res.repuesto.almacen, res.almacen);
        this.idAlmacenRep = res.almacen;
        this.idRep = res.repuesto.proId;
        this.nombreRep = this.asignarNombreCompletoRepuesto(res.repuesto)
        this.stockRep = detallesAlmacen.stock;
        this.ubicacionRepuesto = res.repuesto.proCodPils;
        this.efectivo = res.repuesto.proPvpEfectivo;
        this.tarjeta = res.repuesto.proPvpTarjeta;
        this.f.controls['metodoPago'].value === 1 ? this.precioFinal = res.repuesto.proPvpEfectivo : this.precioFinal = res.repuesto.proPvpTarjeta;

      }
    })

  }

  /*===========================================
  Función para dar el nombre  con marcas y modelos
  ===========================================*/
  asignarNombreCompletoRepuesto(repuesto: Iproducto) {
    var nombreCompleto: string = '';
    nombreCompleto = repuesto.proNombre + ' ';

    if (repuesto.marcas && repuesto.marcas.length > 0) {
      repuesto.marcas.forEach((element: any) => {
        nombreCompleto += element + ', ';
      });
    }

    if (repuesto.modelos && repuesto.modelos.length > 0) {
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
  Función para cargar una cotización
  ===========================================*/
  cargarCotizacion(id: string) {
    this.cotizacionesService.getItem(id).subscribe(
      resp => {
        this.numeroFactura = resp.data.cotId;
        this.fecha = resp.data.cotFecha;
        this.descuentoTotal = resp.data.cotDescuento;
        this.subtotal = resp.data.cotSubtotal;
        this.total = resp.data.cotTotal;
        this.valorIva = resp.data.cotValorIva;
        this.porcentajeIva = resp.data.cotIva;
        this.obtenerCliente(resp.data.cotIdCliente);
        this.f.controls['metodoPago'].setValue(resp.data.cotIdMetPago);
        resp.data.detalles.forEach((element: any) => {

          const detalle: IdetalleVenta = ({
            detId: element.detId,
            detIdFactura: element.detIdFactura,
            detAlmacen: element.detAlmacen,
            detPrecio: element.detPrecio,
            detCantidad: element.detCantidad,
            detTotal: element.detTotal,
            detIdProducto: element.detIdProducto,
            detEstado: element.detEstado,
            delDescuento: element.delDescuento,
            repuesto: element.nombre,
            almacen: this.nombreIdAlmacen(element.detAlmacen),
            ubicacion: element.codigoPils
          } as IdetalleVenta)

          this.detalle.push(detalle);

        });
      }
    )
  }

  /*===========================================
  Función para actualizar la cotización
  ===========================================*/
  actualizarCotizacion() {

    alerts.confirmAlert("¿ Desea finalizar la cotizacion?", "", "question", "Si, guardar").then(
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

            cotId: this.numeroFactura,
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
          this.cotizacionesService.putData(dataCotizacion).subscribe(
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


  /*===========================================
  Función  cambio de id por nombre de  modelos
  ===========================================*/
  obtenerModeloID(lst: any) {
    if ( !lst || lst.length <= 0) { return ' '; } // Cambiado de lst.length < 0 a lst.length <= 0

    let valores: string[] = [];

    for (let item of lst) {
      const objetoEncontrado = this.modelosListado.find((m) => m.modId === item.idModelo);
      if (objetoEncontrado) {
        valores.push(objetoEncontrado.modNombre);
      }
    }

    return valores;
}


  /*===========================================
  Función  cambio de id por nombre de marcas 
  ===========================================*/

  obtenerMarcaID(lst: any) {
    if (!lst || lst.length <= 0) { return ' '; } // Verifica si lst es undefined o null antes de intentar acceder a su propiedad length

    let valores: string[] = [];

    for (let item of lst) {
      const objetoEncontrado = this.marcasListado.find((m) => m.marId === item.idMarca);
      if (objetoEncontrado) {
        valores.push(objetoEncontrado.marNombre);
      }
    }

    return valores;
}





  /*===========================================
  Función para cargar datos del cliente
  ===========================================*/

  obtenerCliente(id: number) {
    const identificacion = this.clienteListado.find(c => c.cliId === id)?.cliIdentificacion;
    this.f.controls['identificacion'].setValue(identificacion);
  }

  /*==============================================
  Función para guardar una cotizacion como factura 
  =============================================*/

  facturarCotizacion() {

    this.detalleNoDisponible = [];

    this.productosService.getProductStore().subscribe(
      resp => {
        const productosInventario: IproductoAlmacen[] = resp.data;
        this.detalle.forEach((element: IdetalleVenta, index: number) => {
          var disponible = productosInventario.find(item => item.productoId === element.detIdProducto &&
            item.almacenId === element.detAlmacen &&
            item.stock >= element.detCantidad);
          if (!disponible) {
            this.cambiarColorFila(index.toString());
            this.detalleNoDisponible.push(disponible);
          }
        });

        if (this.detalleNoDisponible.length > 0) {
          alerts.basicAlert('Stock Insuficiente', 'Algunos productos no tienen la cantidad suficiente disponible', 'error');
        } else {

          alerts.confirmAlert("¿ Desea guardar como venta?", "", "question", "Si, guardar").then(
            (result) => {
              if (result.isConfirmed) {
                this.agregarVenta();
              }
            }
          )

        }

      }
    )


  }


  /*==============================================
  Función para alertar stock bajo en la venta
  =============================================*/

  cambiarColorFila(idFila: string): void {
    const fila = document.getElementById(idFila);
    if (fila) {
      fila.style.backgroundColor = "#F8A9A9"
    }
  }



  /*===========================================
  Función para agregar una venta
  ===========================================*/
  agregarVenta() {
    /*====================================================
    Capturar la información del formulario en la Interfaz
    =====================================================*/

    const dataVenta: Iventa = {

      facId: 0,
      facFecha: this.fecha,
      facSubtotal: this.subtotal,
      facDescuento: this.descuentoTotal,
      facIva: iva.etiqueta,
      facValorIva: this.valorIva,
      facTotal: this.total,
      facEstado: this.checkboxControl.value ? 1 : 0,
      facIdEmpleado: this.empleadoId,
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
