import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { enviroment } from 'src/app/enviroments/enviroments';
import { alerts } from 'src/app/helpers/alerts';
import { functions } from 'src/app/helpers/functions';
import { Ialmacen } from 'src/app/interface/ialmacen';
import { Imarca } from 'src/app/interface/imarca';
import { Imodelo } from 'src/app/interface/imodelo';
import { Iproducto } from 'src/app/interface/iproducto';
import { Iproveedor } from 'src/app/interface/iproveedor';
import { AlmacenesService } from 'src/app/services/almacenes.service';
import { ImagenesService } from 'src/app/services/imagenes.service';
import { MarcasService } from 'src/app/services/marcas.service';
import { ModelosService } from 'src/app/services/modelos.service';
import { ProductosService } from 'src/app/services/productos.service';
import { ProveedoresService } from 'src/app/services/proveedores.service';

export interface IproductoMarcas {

  proMarId: number,
  idProducto: number,
  idMarca: number
}

export interface IproductoModelos {

  proModId: number,
  idProducto: number,
  idModelo: number
}


export interface IproductoAlmacenes {

  almProId: number,
  almacenId: number,
  productoId: number,
  stock: number
}

@Component({
  selector: 'app-nuevo-repuesto',
  templateUrl: './nuevo-repuesto.component.html',
  styleUrls: ['./nuevo-repuesto.component.css']
})
export class NuevoRepuestoComponent implements OnInit {



  /*=================
  Grupo de Controles
  ===================*/

  public f: FormGroup = this.form.group({
    numeroParte: ['', {
      validators: Validators.pattern('[0-9a-zA-ZáéíóúñÁÉÍÓÚÑ /-]*'),
      asyncValidators: this.numeroParteRepetido(),
      updateOn: 'blur'
    }],

    codPils: ['', {
      validators: [Validators.required, Validators.pattern('[0-9a-zA-ZáéíóúñÁÉÍÓÚÑ /-]*')],
      asyncValidators: this.codigoPilsRepetido(),
      updateOn: 'blur'
    }],


    presentacion: ['Pieza', Validators.required],
    nombre: ['', [Validators.required]],
    marca: [''],
    modelo: [''],
    precio: ['', Validators.required],
    precioCompra: [0],
    almacen: new FormArray([this.form.group({
      almacenId: [1, Validators.required],
      stock: ['', Validators.required]
    })]),
    proveedor: [null],
    descripcion: [''],
    stockMinimo: [1],
    imagen: []
  })

  /*===========================================
  Validación personalizada
  ===========================================*/
  get numeroParte() { return this.f.get('numeroParte') }
  get presentacion() { return this.f.get('presentacion') }
  get nombre() { return this.f.get('nombre') }
  get precio() { return this.f.get('precio') }
  get codPils() { return this.f.get('codPils') }
  get almacen() { return this.f.get('almacen') as any }
  get stockMinimo() { return this.f.get('stockMinimo') }
  get imagen() { return this.f.get('imagen') }





  /*===========================================
  Variable para la información de marcas y modelos
  ===========================================*/
  marcas: Imarca[] = [];
  modelos: Imodelo[] = [];
  almacenes: Ialmacen[] = [];
  proveedores: Iproveedor[] = [];

  /*===========================================
  Variable que valida el envío del formulario
    ===========================================*/

  formSubmitted = false;

  /*===========================================
  Variable de precarga
  ===========================================*/

  loadData = false;


  /*===========================================
  Variables para guardar los diferentes  precios
  ===========================================*/

  precioTarjeta = 0;

  /*===========================================
  Variables para guardar el stock total
  ===========================================*/
  stockTotal = 0;

  /*===========================================
  Variables para cel numero de almacenes // verificar se utiliza o no 
  ===========================================*/
  numeroAlmacenes = 0;

  /*===========================================
  Listado de marcas a enviar a la base de datos
  ===========================================*/
  productoMarcas: IproductoMarcas[] = [];


  /*===========================================
  Listado de modelos a enviar a la base de datos
  ===========================================*/
  productoModelos: IproductoModelos[] = [];


  /*===========================================
  Listado de almacenes a enviar a la base de datos
  ===========================================*/
  productoAlmacenes: IproductoAlmacenes[] = [];

  /*===========================================
  Variable contador para almacenes duplicados
  ===========================================*/
  duplicadoAlmacen = 0;

  /*===========================================
  Variable almacenar el listado de productos registrados
  ===========================================*/
  productosListado: Iproducto[] = [];


  /*===========================================
  Variable para autocompletado del nombre de repuestos
  ===========================================*/

  filterOptions: any[] = [];
  filterOptionsCodigo: any[] = [];

  /*===========================================
  Listado de almacenesy ubicacion registrados
  ===========================================*/
  alamcenUbicaion: IproductoAlmacenes[] = [];


  /*===========================================
  Variable que almacene la imagen temporal
  ===========================================*/

  imgTemp = "";
  uploadFile: any;
  nameImage = "";
  urlImagen = "";

  constructor(private form: FormBuilder,
    private marcasService: MarcasService,
    private modelosService: ModelosService,
    private almacenesService: AlmacenesService,
    private proveedoresService: ProveedoresService,
    private productosService: ProductosService,
    private imagenesService: ImagenesService,
    private router: Router
  ) { }


  ngOnInit(): void {
    this.cargarListas();
    this.initForm();

  }

  /*=========================
  Función para cargar listas iniciales de modelos  y marcas
  ==============================*/
  cargarListas() {

    this.modelosService.getData().subscribe(
      resp => {
        this.modelos = resp.data;
        this.modelos = this.modelos.filter(item => item.modEstado === 1);

      }
    )

    this.marcasService.getData().subscribe(
      resp => {
        this.marcas = resp.data;
       this.marcas = this.marcas.filter(item=> item.marEstado === 1);

      }
    )

    this.almacenesService.getData().subscribe(
      resp => {
        this.almacenes = resp.data;
        this.almacenes = this.almacenes.filter(item => item.almEstado === 1);

      }
    )

    this.proveedoresService.getData().subscribe(
      resp => {
        this.proveedores = resp.data;
        this.proveedores = this.proveedores.filter(item => item.proActivo === 1);
      }
    )

    this.productosService.getData().subscribe(
      resp => {
        this.productosListado = resp.data;
        this.filterOptions = resp.data;
        this.filterOptionsCodigo = resp.data;

      }
    )

    this.productosService.getProductStore().subscribe(
      resp => {
        this.alamcenUbicaion = resp.data;

      }
    )

  }


  /*====================================
  Funciones para autocompletar el nombre y el codigo
    ====================================*/

  initForm() {
    this.f.get('nombre')?.valueChanges.subscribe(resp => {
      if (resp != null) {
        this.filterData(resp.toUpperCase(), 'nombre');
      }
    })

    this.f.get('codPils')?.valueChanges.subscribe(resp => {
      if (resp != null) {
        this.filterData(resp.toUpperCase(), 'codPils');
      }
    })
  }

  filterData(resp: any, opcion: string) {
    if (opcion === 'nombre') {
      this.filterOptions = this.productosListado.filter((producto) => producto.proNombre.toUpperCase().includes(resp));

    } else {
      this.filterOptionsCodigo = this.productosListado.filter((producto) => {
        const proCodPils = producto.proCodPils;
        return proCodPils && proCodPils.toUpperCase().includes(resp);
      });
    }

  }



  /*=========================
  Validacion formulario
  ==============================*/

  invalidField(field: string) {
    return functions.invalidField(field, this.f, this.formSubmitted)
  }

  /*=========================
  Función para guardar Repuesto
  ==============================*/

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

    /*=========================================
    Infomación en la interfaz de productoMarcas  
    ===========================================*/

    var auxMarcas = this.f.controls['marca'].value;

    if (auxMarcas.length > 0) {
      auxMarcas.forEach((idMarca: any) => {
        const dataMarca: IproductoMarcas = {
          proMarId: 0,
          idProducto: 0,
          idMarca: idMarca
        }
        this.productoMarcas.push(dataMarca);
      });

    }



    /*=========================================
    Infomación en la interfaz de productoModelos  
    ===========================================*/

    var auxModelos = this.f.controls['modelo'].value;

    if (auxModelos.length > 0) {

      auxModelos.forEach((idModelo: any) => {

        const dataModelo: IproductoModelos = {
          proModId: 0,
          idProducto: 0,
          idModelo: idModelo
        }
        this.productoModelos.push(dataModelo);

      });

    }



    /*=========================================
    Infomación en la interfaz de productoAlmacenes 
    ===========================================*/

    var auxAlmacenes = this.almacen.value;

    auxAlmacenes.forEach((elemet: any) => {
      this.stockTotal = this.stockTotal + elemet.stock;
      const dataAlmacen: IproductoAlmacenes = {
        almProId: 0,
        almacenId: elemet.almacenId,
        productoId: 0,
        stock: elemet.stock
      }
      this.productoAlmacenes.push(dataAlmacen);

    });

    /*======================
    Subir imagen al servidor  
    ========================*/

    if (this.uploadFile) {

      const subirImagen = new Promise<void>((resolve, reject) => {
        this.imagenesService.post(this.uploadFile, 'Product').subscribe(
          res => {
            if (res.exito === 1) {
              this.urlImagen = enviroment.urServidorImagen+res.data;
              resolve();

            } else {
              reject();
            }
          }
        )
      });

      await subirImagen;

    }




    /*=================================================================
    Capturar la información del formulario del formulario en la interfaz
    ===================================================================*/

    const dataProducto: Iproducto = {

      proId: 0,
      proNumParte: this.f.controls['numeroParte'].value.toUpperCase(),
      proNombre: this.f.controls['nombre'].value.toUpperCase(),
      proPrecioCompra: this.f.controls['precioCompra'].value,
      proPvpEfectivo: this.f.controls['precio'].value,
      proPvpTarjeta: this.precioTarjeta,
      proDescripcion: this.f.controls['descripcion'].value,
      proPresentacion: this.f.controls['presentacion'].value,
      proUrlImagen:this.urlImagen,
      proEstado: 1,
      proStockTotal: this.stockTotal,
      proProvId: this.f.controls['proveedor'].value,
      proStockMinimo: this.f.controls['stockMinimo'].value,
      proCodPils: this.f.controls['codPils'].value.toUpperCase(),
      marcas: this.productoMarcas,
      modelos: this.productoModelos,
      almacen: this.productoAlmacenes
    }

    /*===========================================
    Guardar la informacion en base de datos
    =========================================*/

    this.productosService.postData(dataProducto).subscribe(
      resp => {
        if (resp.exito === 1) {
          this.loadData = false;
          alerts.saveAlert('Ok', resp.mensaje, 'success').then(() => this.router.navigate(['/repuestos']))
        } else {
          this.loadData = false;
          alerts.basicAlert('Error Servidor', resp.mensaje, 'error');

        }
      }
    )

  }

  eliminarAlmacen(i: any) {

    alerts.confirmAlert("¿ Estás seguro de eliminar ?", "La información ya no se puede recuperar", "warning", "Si, eliminar").then(
      (result) => {
        if (result.isConfirmed) {
          if (i > 0) {
            this.almacen.removeAt(i);
            this.duplicadoAlmacen--;
          }

        }
      }
    )

  }

  addAlmacen() {

    this.duplicadoAlmacen++;

    this.almacen.push(this.form.group({
      almacenId: ['', Validators.required],
      stock: ['', Validators.required]
    }))
  }


  /*===============================
  Función para actualizar valor  los precios
  ================================*/
  cambioPrecio(e: any) {

    this.precioTarjeta = Math.ceil(e + (e * 0.05));

  }

  /*==========================================================
  Función para verificar si se selecciona un almacen duplicado
  ============================================================*/

  almacenDuplicado(e: any) {
    for (let index = 0; index < this.duplicadoAlmacen; index++) {
      if (this.almacen.value[index].almacenId == e.value) {
        alerts.basicAlert('Alerta', 'Almacén duplicado', 'warning')
      }

    }

  }


  /*=======================================
  Función para validar numero de parte repetido
  ==========================================*/

  numeroParteRepetido() {
    return (control: AbstractControl) => {
      const valor = control.value;
      return new Promise((resolve) => {
        // Verificar si el valor no es nulo ni indefinido antes de buscar en la lista
        if (valor != null && valor != '' && this.productosListado?.find(p => p.proNumParte === valor)) {
          resolve({ numeroParteRepetido: true });
        }
        resolve(false);
      });
    };
  }



  /*=======================================
  Función para validar codPils repetido
  ==========================================*/

  codigoPilsRepetido() {
    return (control: AbstractControl) => {
      const valor = control.value;

      return new Promise((resolve) => {

        if (this.productosListado?.find(p => p.proCodPils === valor)) {
          resolve({ codPilsRepetido: true })
        }

        resolve(false)

      })

    }

  }


  /*===================
Validacion de imagen
=======================*/

  validarImagen(e: any) {

    functions.validateImage(e).then(
      (resp: any) => {
        this.imgTemp = resp;
        this.uploadFile = e.target.files[0];
      })
  }


}
