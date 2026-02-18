import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { functions } from 'src/app/helpers/functions';
import { alerts } from 'src/app/helpers/alerts';
import { iva } from 'src/app/enviroments/enviroments';
import { Icliente } from 'src/app/interface/icliente';
import { Iproducto } from 'src/app/interface/iproducto';
import { IdetalleVenta } from 'src/app/interface/idetalle-venta';
import { Icotizacion } from 'src/app/interface/icotizacion';
import { ClientesService } from 'src/app/services/clientes.service';
import { ProductosService } from 'src/app/services/productos.service';
import { AlmacenesService } from 'src/app/services/almacenes.service';
import { CotizacionesService } from 'src/app/services/cotizaciones.service';
import { Ialmacen } from 'src/app/interface/ialmacen';
import { IproductoAlmacen } from 'src/app/interface/iproducto-almacen';
import { takeUntil } from 'rxjs';
import { IproductoFilter } from 'src/app/interface/iproductoFilter';


@Component({
  selector: 'app-nueva-cotizacion',
  templateUrl: './nueva-cotizacion.component.html',
  styleUrls: ['./nueva-cotizacion.component.css']
})
export class NuevaCotizacionComponent implements OnInit {

 @ViewChild('inputProducto') inputProducto!: ElementRef;
  @ViewChild('inputCantidad') inputCantidad!: ElementRef;

  public f: FormGroup = this.form.group({
    identificacion: ['', [Validators.required, Validators.pattern('[0-9]*')]],
    cantidad: ['1', { validators: Validators.required, asyncValidators: this.validarCantidad(), updateOn: 'blur' }],
    precio: [{ value: 0, disabled: true }],
    descuento: [''],
    metodoPago: [2],
  });

  get cantidad() { return this.f.get('cantidad') }
  get precio() { return this.f.get('precio') }
  get descuento() { return this.f.get('descuento') }
  get identificacion() { return this.f.get('identificacion') }
  get metodoPago() { return this.f.get('metodoPago') }

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

  constructor(
    private form: FormBuilder,
    private clientesService: ClientesService,
    private productosService: ProductosService,
    private almacenesService: AlmacenesService,
    private cotizacionesService: CotizacionesService,
    private router: Router,
    public dialog: MatDialog
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

    this.cotizacionesService.getNumberCotizacion().subscribe(
      resp => {
        this.numeroCotizacion = resp.data + 1;
      }
    );

    this.clientesService.getData().subscribe(resp => {
      this.clienteListado = resp.data;
      this.filterOptions = resp.data;
      this.f.patchValue({
        identificacion: resp.data[this.filterOptions.length-1].cliIdentificacion
      });
    });
    this.almacenesListado = await functions.verificacionAlmacenes(this.almacenesService);
  }

  initForm() {
    this.f.get('identificacion')?.valueChanges.subscribe(resp => {
      this.filterData(resp);
    });
  }



  filterData(resp: any) {
    this.nombre = '';
    this.direccion = '';
    this.idCliente = 0;
    
    this.filterOptions = this.clienteListado.filter(cliente => 
      cliente.cliIdentificacion.includes(resp)
    );
    
    if (this.filterOptions.length > 0) {
      this.nombre = this.filterOptions[0].cliNombres + ' ' + this.filterOptions[0].cliApellidos;
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
    const cliente = this.clienteListado.find(c => c.cliIdentificacion === identificacion);
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
      detAlmacen: 0,
      detPrecio: 0,
      detCantidad: 1,
      detTotal: 0,
      detIdProducto: 0,
      detEstado: 0,
      delDescuento: 0,
      repuesto: '',
      almacen: '',
      ubicacion: '',
      precioTarjeta: 0,
      precioEfectivo: 0,
      codigo: '',
      busquedaNombre: '',
      productosFilter: [],
      stockDisponible: 0
    };
    this.detalle.push(filaVacia);
  }

  buscarPorCodigo(item: any, index: number) {
    const codigo = item.codigo?.trim();
    if (!codigo) return;
    
    // Mostrar loading
    item.buscando = true;
    
    // Simular petición al servidor con delay
    setTimeout(() => {
      const producto = this.productosListado.find((p: any) => 
        p.proCodPils?.toLowerCase() === codigo.toLowerCase()
      );
      
      item.buscando = false;
      
      if (producto) {
        console.log('Producto encontrado por código:', producto);
        this.cargarProductoEnFila(producto, item);
      } else {
        alerts.basicAlert('Producto no encontrado', `No se encontró un producto con el código: ${codigo}`, 'warning');
        item.codigo = '';
      }
    }, 800); // Simula 800ms de petición al servidor
  }

buscarPorNombre(item: any, index: number) {
  const busqueda = item.busquedaNombre;

  if (!busqueda || busqueda.length < 2) {
    item.productosFilter = [];
    item.buscando = false;
    // Cancelar cualquier petición pendiente
    this.productosService.cancelarPeticion();
    return;
  }

  clearTimeout(item.timeoutId);
  item.buscando = true;

  item.timeoutId = setTimeout(() => {
    // Cancela la petición anterior antes de lanzar la nueva
    this.productosService.cancelarPeticion();
    let filtroProductos : IproductoFilter = 
    {
        IdMarca :null,
        IdModelo :null,
        IdAlmacen :null,
        Nombre :busqueda,
        CodigoPils :null,
        NumeroElementos : null
    };
    this.productosService
      .getFilterData(filtroProductos)
      .pipe(takeUntil(this.productosService.cancelarBusqueda$))
      .subscribe({
        next: (productos) => {
          console.log(productos);
          item.productosFilter = productos.data;
          this.productosListado = productos.data;
          item.buscando = false;
        },
        error: (error) => {
          console.error('Error al buscar productos:', error);
          item.buscando = false;
        },
      });
  }, 300);
}


  seleccionarProductoEnFila(event: MatAutocompleteSelectedEvent, item: any, index: number) {
    const producto = event.option.value;
    
    // Verificar si el producto ya existe en el detalle
    const productoExistente = this.detalle.find((det, idx) => 
      det.detIdProducto === producto.proId && idx !== index
    );
    
    if (productoExistente) {
      // Producto duplicado: sumar cantidades
      const nuevaCantidad = productoExistente.detCantidad + item.detCantidad;
      const stockDisponible = this.calcularStockDisponible(producto.proId);
      
      if (nuevaCantidad > stockDisponible) {
        alerts.basicAlert(
          'Stock insuficiente', 
          `El producto "${producto.proNombre}" ya está en la cotización con cantidad ${productoExistente.detCantidad}. ` +
          `Si suma ${item.detCantidad} más, totaliza ${nuevaCantidad} unidades, pero solo hay ${stockDisponible} disponibles.`,
          'error'
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
        'success'
      );
    } else {
      // Producto nuevo: cargar normalmente
      this.cargarProductoEnFila(producto, item);
    }
    
    this.recalcularTotales();
  }

  cargarProductoEnFila(producto: any, item: any) {
    console.log(producto);
    const stockDisponible = this.calcularStockDisponible(producto.proId);

    item.detIdProducto = producto.proId;
    item.detAlmacen = this.idAlmacenEmpleado;
    item.codigo = producto.proCodPils;
    item.ubicacion = producto.proCodPils;
    item.busquedaNombre = producto.proNombre;
    item.repuesto = this.asiganarNombreCompletoRepuesto(producto);
    item.almacen = this.nombreIdAlmacen(this.idAlmacenEmpleado) || 'Principal';
    item.stockDisponible = stockDisponible;
    item.precioTarjeta = producto.proPvpTarjeta;
    item.precioEfectivo = producto.proPvpEfectivo;
    item.detPrecio = this.selectTarjeta ? producto.proPvpTarjeta : producto.proPvpEfectivo;
    
    this.calcularTotalFila(item);
    this.recalcularTotales();
  }

  calcularTotalFila(item: any) {
    if (!item.detIdProducto) return;
    
    const stockDisponible = this.calcularStockDisponible(item.detIdProducto);
    const cantidadActual = item.detCantidad || 0;
    
    // Validar que no exceda el stock disponible
    if (cantidadActual > stockDisponible) {
      alerts.basicAlert(
        'Cantidad no disponible',
        `Solo hay ${stockDisponible} unidades disponibles de "${item.repuesto}". No puede cotizar ${cantidadActual} unidades.`,
        'warning'
      );
      item.detCantidad = stockDisponible > 0 ? stockDisponible : 1;
    }
    
    if (item.detCantidad && item.detPrecio) {
      item.detTotal = functions.aproximarDosDecimales(item.detCantidad * item.detPrecio);
      this.recalcularTotales();
    }
  }

  recalcularTotales() {
    this.total = 0;
    this.detalle.forEach((item: any) => {
      if (item.detIdProducto > 0) {
        this.total += item.detTotal || 0;
      }
    });
    
    this.valorIva = functions.aproximarDosDecimales(this.total * iva.valor);
    this.subtotal = functions.aproximarDosDecimales(this.total - this.valorIva);
    this.aplicarDescuentoGeneral();
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
        item.detPrecio = this.selectTarjeta ? item.precioTarjeta : item.precioEfectivo;
        this.calcularTotalFila(item);
      }
    });
    
    this.recalcularTotales();
  }

  aplicarDescuentoGeneral() {
    const descuento = this.f.controls['descuento'].value || 0;
    
    if (descuento) {
      const valorDescuento = functions.aproximarDosDecimales(this.total * (descuento / 100));
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
      const valorDescuento = functions.aproximarDosDecimales(element.detTotal * (descuento / 100));
      element.delDescuento = descuento ? valorDescuento : 0;
    });
  }

  guardar() {
    alerts.confirmAlert('¿Desea guardar la cotización?', '', 'question', 'Sí, guardar').then(result => {
      if (result.isConfirmed) {
        this.loadData = true;
        
        const detallesValidos = this.detalle.filter((item: any) => item.detIdProducto > 0);
        
        detallesValidos.forEach((element: any) => {
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
          cotEstado: this.checkboxControl.value ? 1 : 0,
          cotIdCliente: this.idCliente,
          cotIdMetPago: this.f.controls['metodoPago'].value,
          detalles: detallesValidos
        };
        
        this.cotizacionesService.postData(dataCotizacion).subscribe(resp => {
          if (resp.exito === 1) {
            this.loadData = false;
            alerts.saveAlert('Ok', resp.mensaje, 'success').then(() => this.router.navigate(['/cotizacion']));
          } else {
            this.loadData = false;
            alerts.basicAlert('Error Servidor', resp.mensaje, 'error');
          }
        });
      }
    });
  }

  validarFormulario(): boolean {
    const detallesValidos = this.detalle.filter((item: any) => item.detIdProducto > 0);
    return detallesValidos.length > 0 && this.idCliente > 0;
  }

  invalidField(field: string) {
    return functions.invalidField(field, this.f, this.formSubmitted);
  }

  asiganarNombreCompletoRepuesto(repuesto: Iproducto) {
    let nombreCompleto: string = repuesto.proNombre + ' ';
    if (repuesto.marcas && repuesto.marcas.length > 0) {
      repuesto.marcas.forEach((element: any) => {
        nombreCompleto += element + ', ';
      });
    }
    if (repuesto.modelos) {
      repuesto.modelos.forEach((element: any, index: number) => {
        if (index === repuesto.modelos.length - 1) {
          nombreCompleto += element;
        } else {
          nombreCompleto += element + ', ';
        }
      });
    }
    return nombreCompleto;
  }

  obtenerStockUbicacionPorIdAlmacen(almacenes: any[], idAlmacen: number) {
    const almacenSeleccionado = almacenes.find(almacen => almacen.almId === idAlmacen);
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
    return this.almacenesListado.find(a => a.almId === id)?.almNombre;
  }

  calcularStockDisponible(productoId: number): number {
    const producto = this.productosListado.find(p => p.proId === productoId);
    if (!producto) return 0;
    
    const detallesAlmacen = this.obtenerStockUbicacionPorIdAlmacen(producto.almacenes, this.idAlmacenEmpleado);
    const stockTotal = detallesAlmacen.stock || 0;
    
    // Restar las cantidades ya cotizadas en otras filas
    const cantidadCotizada = this.detalle
      .filter(det => det.detIdProducto === productoId)
      .reduce((sum, det) => sum + (det.detCantidad || 0), 0);
    
    return stockTotal - cantidadCotizada;
  }

  limpiarFila(item: any) {
    item.detIdProducto = 0;
    item.codigo = '';
    item.repuesto = '';
    item.busquedaNombre = '';
    item.stockDisponible = 0;
    item.almacen = '';
    item.detAlmacen = 0;
    item.detPrecio = 0;
    item.detCantidad = 1;
    item.detTotal = 0;
    item.productosFilter = [];
  }

  buscarCliente() {
    const identificacion = this.f.get('identificacion')?.value;
    if (!identificacion) {
      alerts.basicAlert('Campo vacío', 'Ingrese un número de cédula o RUC', 'warning');
      return;
    }
    
    const cliente = this.clienteListado.find(c => c.cliIdentificacion === identificacion);
    if (cliente) {
      this.idCliente = cliente.cliId;
      this.nombre = cliente.cliNombres + ' ' + cliente.cliApellidos;
      this.direccion = cliente.cliDireccion;
      alerts.basicAlert('Cliente encontrado', `${this.nombre}`, 'success');
    } else {
      alerts.basicAlert('No encontrado', 'No existe un cliente con esa identificación', 'error');
      this.nombre = '';
      this.direccion = '';
      this.idCliente = 0;
    }
  }
}
