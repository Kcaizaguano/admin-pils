import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
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
    descuento: [0],

  })

  /*===========================================
  Validación personalizada
  ===========================================*/
  get cantidad() { return this.f.get('cantidad') }
  get precio() { return this.f.get('precio') }
  get descuento() { return this.f.get('descuento') }
  get identificacion() { return this.f.get('identificacion') }



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
  Variable de datos de la factura
  ===========================================*/
  fecha: Date = new Date();
  numeroFactura = 0;


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


  constructor(private form: FormBuilder,
    private clientesService: ClientesService,
    private ciudadesService: CiudadesService,
    private productosService: ProductosService,
    private almacenesService: AlmacenesService,
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

  }

  guardar() {

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
    var subTotal = cantidad * precio;
    var valorDescuento = subTotal * (descuento / 100);

    const detalle: IdetalleVenta = ({
      detAlmacen: this.idAlmacenRep,
      detPrecio: precio,
      detCantidad: cantidad,
      detTotal: subTotal - valorDescuento,
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
      if (res != undefined) {

        var detallesAlmacen = this.obtenerStockUbicacionPorIdAlmacen(res.repuesto.almacen, res.almacen);

        this.idAlmacenRep = res.almacen;
        this.idRep = res.repuesto.proId;
        this.nombreRep = this.asiganarNombreCompletoRepuesto(res.repuesto)
        this.stockRep = detallesAlmacen.stock;
        this.ubicacionRepuesto = detallesAlmacen.ubicacion;
        this.efectivo = res.repuesto.proPvpEfectivo;
        this.tarjeta = res.repuesto.proPvpTarjeta;
        //this.f.controls['identificacion'].setValue(res.cliIdentificacion);

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
        ubicacion: almacenSeleccionado.proCodUbicacion
      };
    }
    return {
      stock: 0,
      ubicacion: ""
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
  Función para elminar un detalle de la venta
  ===========================================*/
  eliminarDetalle(i: any) {
    this.detalle.splice(i, 1);
  }


  /*===========================================
  Función para editar un detalle de la venta
  ===========================================*/
  editarDetalle(elemento: any, posicion: any) {

    this.idAlmacenRep = elemento.detAlmacen;
    this.idRep = elemento.detIdProducto;
    //.nombreRep = this.asiganarNombreCompletoRepuesto(elemento.detIdProducto);
    this.f.controls['cantidad'].setValue(elemento.detCantidad);
    //this.f.controls['precio'].setValue(elemento.detPrecio);
    this.f.controls['descuento'].setValue(elemento.delDescuento);


    // this.stockRep = this.obtenerStockPorIdAlmacen(elemento.repuesto.almacen, elemento.almacen);
    // this.efectivo = elemento.repuesto.proPvpEfectivo;
    // this.tarjeta = elemento.repuesto.proPvpTarjeta;
    // this.efectivoMayor = elemento.repuesto.proPvMayEfectivo;
    // this.tarjetaMayor = elemento.repuesto.proPvMayTarjeta;

  }



}


