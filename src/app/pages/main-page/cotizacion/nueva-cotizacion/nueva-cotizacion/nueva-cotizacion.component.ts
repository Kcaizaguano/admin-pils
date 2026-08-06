import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { functions } from 'src/app/helpers/functions';
import { alerts } from 'src/app/helpers/alerts';
import { iva } from 'src/app/enviroments/enviroments';
import { Icliente } from 'src/app/interface/icliente';
import { Icotizacion } from 'src/app/interface/icotizacion';
import { ClientesService } from 'src/app/services/clientes.service';
import { ProductosService } from 'src/app/services/productos.service';
import { AlmacenesService } from 'src/app/services/almacenes.service';
import { CotizacionesService } from 'src/app/services/cotizaciones.service';
import { Ialmacen } from 'src/app/interface/ialmacen';
import { IproductoFilter } from 'src/app/interface/iproductoFilter';
import { Imodelo } from 'src/app/interface/imodelo';
import { ModelosService } from 'src/app/services/modelos.service';

@Component({
  selector: 'app-nueva-cotizacion',
  templateUrl: './nueva-cotizacion.component.html',
  styleUrls: ['./nueva-cotizacion.component.css'],
})
export class NuevaCotizacionComponent implements OnInit {
  @ViewChild('inputProducto') inputProducto!: ElementRef;
  @ViewChild('inputCantidad') inputCantidad!: ElementRef;

  public f: FormGroup = this.form.group({
    identificacion: ['', [Validators.required, Validators.pattern('[0-9]*')]],
    cantidad: [
      '1',
      {
        validators: Validators.required,
        asyncValidators: this.validarCantidad(),
        updateOn: 'blur',
      },
    ],
    precio: [{ value: 0, disabled: true }],
    descuento: [''],
    metodoPago: [2],
  });

  get cantidad() {
    return this.f.get('cantidad');
  }
  get precio() {
    return this.f.get('precio');
  }
  get descuento() {
    return this.f.get('descuento');
  }
  get identificacion() {
    return this.f.get('identificacion');
  }
  get metodoPago() {
    return this.f.get('metodoPago');
  }

  formSubmitted = false;
  loadData = false;
  detalle: any[] = [];

  // Cliente
  filterOptions: Icliente[] = [];
  clienteListado: Icliente[] = [];
  idCliente!: number;
  nombre: string = '';
  direccion: string = '';

  // Productos
  busquedaProducto: string = '';
  productosFilter: any[] = [];
  productosListado: any[] = [];
  productoSeleccionado: any = null;

  // Producto seleccionado
  idRep!: number;
  idAlmacenRep!: number;
  nombreRep: string = '';
  stockRep: number = 0;
  tarjeta: number = 0;
  efectivo: number = 0;
  ubicacionRepuesto!: string;
  almacenSeleccionado: string = '';
  precioActual: number = 0;

  // Almacenes
  almacenesListado: Ialmacen[] = [];
  idAlmacenEmpleado = 0;

  // Factura
  fecha: Date = new Date();
  numeroCotizacion = 0;
  subtotal = 0;
  descuentoTotal = 0;
  porcentajeIva = iva.etiqueta;
  valorIva = 0;
  total = 0;
  idEmpleado = 0;

  checkboxControl = new FormControl(false);
  selectTarjeta = true;
  modelos: Imodelo[] = [];
  modeloSeleccionado : any = null;

  constructor(
    private form: FormBuilder,
    private clientesService: ClientesService,
    private productosService: ProductosService,
    private almacenesService: AlmacenesService,
    private cotizacionesService: CotizacionesService,
    private router: Router,
    public dialog: MatDialog,
    private modeloServices: ModelosService,
    
  ) {}

  ngOnInit(): void {
    this.cargarListas();
    this.initForm();
    const usuario = JSON.parse(localStorage.getItem('usuario')!);
    this.idEmpleado = usuario.id;
    this.idAlmacenEmpleado = usuario.almacen;
    
    this.agregarFilaVacia();
  }

  async cargarListas() {
    this.modelos = await functions.verificacionModelos(this.modeloServices);
    this.cotizacionesService.getNumberCotizacion().subscribe((resp) => {
      this.numeroCotizacion = resp.data + 1;
    });

    this.clientesService.getData().subscribe((resp) => {
      this.clienteListado = resp.data;
      this.filterOptions = resp.data;
      this.f.patchValue({
        identificacion:
          resp.data[this.filterOptions.length - 1].cliIdentificacion,
      });
    });
    this.almacenesListado = await functions.verificacionAlmacenes(
      this.almacenesService,
    );
  }

  initForm() {
    this.f.get('identificacion')?.valueChanges.subscribe((resp) => {
      this.filterData(resp);
    });
  }

  filterData(resp: any) {
    this.nombre = '';
    this.direccion = '';
    this.idCliente = 0;

    this.filterOptions = this.clienteListado.filter((cliente) =>
      cliente.cliIdentificacion.includes(resp),
    );

    if (this.filterOptions.length > 0) {
      this.nombre =
        this.filterOptions[0].cliNombres +
        ' ' +
        this.filterOptions[0].cliApellidos;
      this.direccion = this.filterOptions[0].cliDireccion;
      this.idCliente = this.filterOptions[0].cliId;
    }

    if (this.f.get('identificacion')?.value === '') {
      this.nombre = '';
      this.direccion = '';
      this.idCliente = 0;
    }
  }

  seleccionarCliente(event: MatAutocompleteSelectedEvent) {
    const identificacion = event.option.value;
    const cliente = this.clienteListado.find(
      (c) => c.cliIdentificacion === identificacion,
    );
    if (cliente) {
      this.idCliente = cliente.cliId;
      this.nombre = cliente.cliNombres + ' ' + cliente.cliApellidos;
      this.direccion = cliente.cliDireccion;
    }
  }

  focusProducto() {
    setTimeout(() => this.inputProducto?.nativeElement.focus(), 100);
  }

  focusCantidad() {
    setTimeout(() => this.inputCantidad?.nativeElement.focus(), 100);
  }
  agregarFilaVacia() {
    const filaVacia = {
      detId: 0,
      detIdFactura: 0,
      detAlmacen: this.idAlmacenEmpleado,
      detPrecio: 0,
      detCantidad: 1,
      detTotal: 0,
      detIdProducto: 0,
      detEstado: 0,
      delDescuento: 0,
      porcentajeDescuento: 0,
      repuesto: '',
      almacen: '',
      ubicacion: '',
      precioTarjeta: 0,
      precioEfectivo: 0,
      codigo: '',
      busquedaNombre: '',
      productosFilter: [],
      stockDisponible: 0,
      almacenesDisponibles: [],
      productoCompleto: null,
    };
    this.detalle.push(filaVacia);
  }

  buscarPorCodigo(item: any, index: number) {
    const codigo = item.codigo?.trim();
    if (!codigo) return;

    item.buscando = true;
    let filtroProductos: IproductoFilter = {
      IdMarca: null,
      IdModelo: null,
      IdAlmacen: null,
      Nombre: null,
      CodigoPils: codigo,
      NumeroElementos: null,
    };

    this.productosService.getFilterData(filtroProductos).subscribe((resp) => {
      if (resp.exito !== 1 || !resp.data || resp.data.length === 0) {
          alerts.basicAlert(
            'No encontrado',
            `No se encontraron productos con el codigo : ${codigo} }` , 'info' );
      item.buscando = false;

        }
      const producto = resp.data[0];
      item.buscando = false;
      if (producto && resp.data.length > 0) {
        item.busquedaNombre = producto;
        const productoExistente = this.detalle.find(
          (det, idx) => det.detIdProducto === producto.proId && idx !== index ,
        );
        if (productoExistente) {
          // Producto duplicado: sumar cantidades
          const nuevaCantidad =
            productoExistente.detCantidad + item.detCantidad;
          const stockDisponible = this.calcularStockDisponible(producto);
          if (nuevaCantidad > stockDisponible) {
            alerts.basicAlert(
              'Stock insuficiente',
              `El producto "${producto.proNombre}" ya está en la cotización con cantidad ${productoExistente.detCantidad}. ` +
                `Si suma ${item.detCantidad} más, totaliza ${nuevaCantidad} unidades, pero solo hay ${stockDisponible} disponibles.`,
              'error',
            );
            this.limpiarFila(item);
            return;
          }

          // Actualizar cantidad en el registro existente
          productoExistente.detCantidad = nuevaCantidad;
          this.calcularTotalFila(productoExistente);

          // Eliminar la fila actual
          this.detalle.splice(index, 1);

          alerts.basicAlert(
            'Producto actualizado',
            `Se actualizó la cantidad del producto "${producto.proNombre}" a ${nuevaCantidad} unidades.`,
            'success',
          );
        } else {
          // Producto nuevo: cargar normalmente
          this.cargarProductoEnFila(producto, item);
        }
      } else {
        alerts.basicAlert(
          'Producto no encontrado',
          `No se encontró un producto con el código: ${codigo}`,
          'warning',
        );
        item.codigo = '';
      }
    });
  }

  buscarPorNombre(item: any) {
    const busqueda = item.busquedaNombre?.trim();
    if (!busqueda || busqueda.length < 2) return;

    item.buscando = true;
    let filtroProductos: IproductoFilter = {
      IdMarca: null,
      IdModelo: this.modeloSeleccionado,
      IdAlmacen: null,
      Nombre: busqueda,
      CodigoPils: null,
      NumeroElementos: null,
    };

    this.productosService.getFilterData(filtroProductos).subscribe({
      next: (productos) => {
        if (productos.exito !== 1 || !productos.data || productos.data.length === 0) {
          alerts.basicAlert(
            'No encontrado',
            `No se encontraron productos con el nombre: ${busqueda} de ${this.nombreIdModelo(this.modeloSeleccionado)}` , 'info' )
        }
        item.productosFilter = productos.data || [];
        item.buscando = false;
      },
      error: (error) => {
        console.error('Error al buscar productos:', error);
        item.buscando = false;
      },
    });
  }

  seleccionarProductoEnFila(
    event: MatAutocompleteSelectedEvent,
    item: any,
    index: number,
  ) {
    const producto = event.option.value;
    // Verificar si el producto ya existe en el detalle
    const productoExistente = this.detalle.find(
      (det, idx) => det.detIdProducto === producto.proId && idx !== index,
    );
    if (productoExistente) {
      // Producto duplicado: sumar cantidades
      const nuevaCantidad = productoExistente.detCantidad + item.detCantidad;
      const stockDisponible = this.calcularStockDisponible(producto);

      if (nuevaCantidad > stockDisponible) {
        alerts.basicAlert(
          'Stock insuficiente',
          `El producto "${producto.proNombre}" ya está en la cotización con cantidad ${productoExistente.detCantidad}. ` +
            `Si suma ${item.detCantidad} más, totaliza ${nuevaCantidad} unidades, pero solo hay ${stockDisponible} disponibles.`,
          'error',
        );
        this.limpiarFila(item);
        return;
      }

      // Actualizar cantidad en el registro existente
      productoExistente.detCantidad = nuevaCantidad;
      this.calcularTotalFila(productoExistente);

      // Eliminar la fila actual
      this.detalle.splice(index, 1);

      alerts.basicAlert(
        'Producto actualizado',
        `Se actualizó la cantidad del producto "${producto.proNombre}" a ${nuevaCantidad} unidades.`,
        'success',
      );
    } else {
      // Producto nuevo: cargar normalmente
      this.cargarProductoEnFila(producto, item);
    }

    this.recalcularTotales();
  }

  cargarProductoEnFila(producto: any, item: any) {
    item.detIdProducto = producto.proId;
    item.productoCompleto = producto;
    item.detAlmacen = item.detAlmacen || this.idAlmacenEmpleado;
    item.codigo = producto.proCodPils;
    item.ubicacion = producto.proCodPils;
    item.repuesto = this.asiganarNombreCompletoRepuesto(producto);
    item.precioTarjeta = producto.proPvpTarjeta;
    item.precioEfectivo = producto.proPvpEfectivo;
    item.detPrecio = this.selectTarjeta
      ? producto.proPvpTarjeta
      : producto.proPvpEfectivo;
    item.almacenesDisponibles = producto.almacen || producto.almacenes || [];
    this.actualizarStockPorAlmacen(item);
    this.calcularTotalFila(item);
    this.recalcularTotales();
    const stockDisponible = item.stockDisponible || 0;
    const cantidadActual = item.detCantidad || 0;
    if (cantidadActual <= stockDisponible) {
      this.agregarFilaVacia();
    }
  }

  calcularTotalFila(item: any) {
    if (!item.detIdProducto) return;
    const stockDisponible = item.stockDisponible || 0;
    const cantidadActual = item.detCantidad || 0;

    if (cantidadActual > stockDisponible) {
      alerts.basicAlert(
        'Cantidad no disponible',
        `Solo hay ${stockDisponible} unidades disponibles de "${item.repuesto}". No puede cotizar ${cantidadActual} unidades.`,
        'warning',
      );
      item.detCantidad = stockDisponible > 0 ? stockDisponible : 1;
      this.limpiarFila(item);
        return;
    }

    if (item.detCantidad && item.detPrecio) {
      const subtotalFila = item.detCantidad * item.detPrecio;
      const descuento = (item.porcentajeDescuento || 0) / 100;
      item.delDescuento = functions.aproximarDosDecimales(
        subtotalFila * descuento,
      );
      item.detTotal = functions.aproximarDosDecimales(
        subtotalFila - item.delDescuento,
      );
      this.recalcularTotales();
    }
  }

  recalcularTotales() {
    this.total = 0;
    this.descuentoTotal = 0;
    this.detalle.forEach((item: any) => {
      if (item.detIdProducto > 0) {
        this.total += item.detTotal || 0;
        this.descuentoTotal += item.delDescuento || 0;
      }
    });

    this.valorIva = functions.aproximarDosDecimales(this.total * iva.valor);
    this.subtotal = functions.aproximarDosDecimales(this.total - this.valorIva);
  }

  eliminarDetalle(i: any, item: any) {
    this.detalle.splice(i, 1);
    this.recalcularTotales();
    if (this.detalle.length === 0) {
      this.agregarFilaVacia();
    }
  }

  limpiarControles() {
    this.busquedaProducto = '';
    this.productoSeleccionado = null;
    this.nombreRep = '';
    this.stockRep = 0;
    this.almacenSeleccionado = '';
    this.precioActual = 0;
    this.f.controls['cantidad'].setValue('1');
    setTimeout(() => this.inputProducto?.nativeElement.focus(), 100);
  }

  cambiarMetodoPago(metodo: any) {
    if (metodo == 1) {
      this.selectTarjeta = false;
    } else {
      this.selectTarjeta = true;
    }

    this.detalle.forEach((item: any) => {
      if (item.detIdProducto > 0) {
        item.detPrecio = this.selectTarjeta
          ? item.precioTarjeta
          : item.precioEfectivo;
        this.calcularTotalFila(item);
      }
    });

    this.recalcularTotales();
  }

  guardar() {
    alerts
      .confirmAlert(
        '¿Desea guardar la cotización?',
        '',
        'question',
        'Sí, guardar',
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.loadData = true;

          const detallesValidos = this.detalle.filter(
            (item: any) => item.detIdProducto > 0,
          );

          const dataCotizacion: Icotizacion = {
            cotId: 0,
            cotFecha: this.fecha,
            cotSubtotal: this.subtotal,
            cotDescuento: this.descuentoTotal,
            cotIva: iva.etiqueta,
            cotValorIva: this.valorIva,
            cotTotal: this.total,
            cotEstado: this.checkboxControl.value ? 1 : 0,
            cotIdCliente: this.idCliente,
            cotIdMetPago: this.f.controls['metodoPago'].value,
            detalles: detallesValidos,
          };
          this.cotizacionesService
            .postData(dataCotizacion)
            .subscribe((resp) => {
              if (resp.exito === 1) {
                this.loadData = false;
                alerts
                  .saveAlert('Ok', resp.mensaje, 'success')
                  .then(() => this.router.navigate(['/cotizacion']));
              } else {
                this.loadData = false;
                alerts.basicAlert('Error Servidor', resp.mensaje, 'error');
              }
            });
        }
      });
  }

  validarFormulario(): boolean {
    const detallesValidos = this.detalle.filter(
      (item: any) => item.detIdProducto > 0,
    );
    return detallesValidos.length > 0 && this.idCliente > 0;
  }

  invalidField(field: string) {
    return functions.invalidField(field, this.f, this.formSubmitted);
  }

  asiganarNombreCompletoRepuesto(repuesto: any) {
    if (!repuesto) return '';
    let nombreCompleto: string =
      repuesto.proNombre +
      ' ' +
      functions.obtenerNombresModelos(repuesto.modelo);
    return nombreCompleto;
  }

  obtenerStockUbicacionPorIdAlmacen(almacenes: any[], idAlmacen: number) {
    const almacenSeleccionado = almacenes.find(
      (almacen) => almacen.almId === idAlmacen,
    );
    if (almacenSeleccionado != null) {
      return { stock: almacenSeleccionado.stock };
    }
    return { stock: 0 };
  }

  validarCantidad() {
    return (control: AbstractControl) => {
      const valor = Number(control.value);
      return new Promise((resolve) => {
        if (valor > this.stockRep) {
          resolve({ stockBajo: true });
        }
        resolve(null);
      });
    };
  }

  nombreIdAlmacen(id: number) {
    return this.almacenesListado.find((a) => a.almId === id)?.almNombre;
  }

  nombreIdModelo(id: number) {
    return this.modelos.find((a) => a.modId === id)?.modNombre;
  }

  calcularStockDisponible(producto: any): number {
    const detallesAlmacen = this.obtenerStockUbicacionPorIdAlmacen(
      producto.almacenes,
      this.idAlmacenEmpleado,
    );
    const stockTotal = detallesAlmacen.stock || 0;
    return stockTotal ;
  }

  limpiarFila(item: any) {
    item.detIdProducto = 0;
    item.codigo = '';
    item.repuesto = '';
    item.busquedaNombre = '';
    item.stockDisponible = 0;
    item.almacen = '';
    item.detAlmacen = this.idAlmacenEmpleado;
    item.detPrecio = 0;
    item.detCantidad = 1;
    item.detTotal = 0;
    item.porcentajeDescuento = 0;
    item.delDescuento = 0;
    item.productosFilter = [];
    item.almacenesDisponibles = [];
    item.productoCompleto = null;
  }

  buscarCliente() {
    const identificacion = this.f.get('identificacion')?.value;
    if (!identificacion) {
      alerts.basicAlert(
        'Campo vacío',
        'Ingrese un número de cédula o RUC',
        'warning',
      );
      return;
    }

    const cliente = this.clienteListado.find(
      (c) => c.cliIdentificacion === identificacion,
    );
    if (cliente) {
      this.idCliente = cliente.cliId;
      this.nombre = cliente.cliNombres + ' ' + cliente.cliApellidos;
      this.direccion = cliente.cliDireccion;
      alerts.basicAlert('Cliente encontrado', `${this.nombre}`, 'success');
    } else {
      alerts.basicAlert(
        'No encontrado',
        'No existe un cliente con esa identificación',
        'error',
      );
      this.nombre = '';
      this.direccion = '';
      this.idCliente = 0;
    }
  }

actualizarStockPorAlmacen(item: any) {
  if (!item.productoCompleto || !item.almacenesDisponibles?.length) return;

  // Buscar almacén seleccionado
  let almacenSeleccionado = item.almacenesDisponibles.find(
    (alm: any) => alm.almacenId === item.detAlmacen,
  );

  // Si no lo encuentra y solo hay un almacén disponible
  if (!almacenSeleccionado && item.almacenesDisponibles.length === 1) {
    almacenSeleccionado = item.almacenesDisponibles[0];
    item.detAlmacen = almacenSeleccionado.almacenId;
  }

  // 🆕 NUEVA LÓGICA: si el seleccionado tiene stock 0, buscar otro con stock
  if (almacenSeleccionado && (almacenSeleccionado.stock || 0) === 0) {
    const otroConStock = item.almacenesDisponibles.find(
      (alm: any) => alm.stock > 0
    );

    if (otroConStock) {
      almacenSeleccionado = otroConStock;
      item.detAlmacen = otroConStock.almacenId;
    }
  }

  // Asignación final
  if (almacenSeleccionado) {
    item.stockDisponible = almacenSeleccionado.stock || 0;
    item.almacen =
      this.nombreIdAlmacen(almacenSeleccionado.almacenId) || 'Sin almacén';
  } else {
    item.stockDisponible = 0;
    item.almacen = 'Sin stock';
  }
}

  cambiarAlmacenDetalle(item: any) {
    item.detAlmacen = Number(item.detAlmacen);
    this.actualizarStockPorAlmacen(item);
    if (item.detCantidad > item.stockDisponible) {
      item.detCantidad = item.stockDisponible > 0 ? item.stockDisponible : 1;
    }
    this.calcularTotalFila(item);
  }

  aplicarDescuentoDetalle(item: any) {
    this.calcularTotalFila(item);
  }

}
