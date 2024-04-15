import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { alerts } from 'src/app/helpers/alerts';
import { functions } from 'src/app/helpers/functions';
import { Ialmacen } from 'src/app/interface/ialmacen';
import { Imarca } from 'src/app/interface/imarca';
import { Imodelo } from 'src/app/interface/imodelo';
import { Iproveedor } from 'src/app/interface/iproveedor';
import { AlmacenesService } from 'src/app/services/almacenes.service';
import { MarcasService } from 'src/app/services/marcas.service';
import { ModelosService } from 'src/app/services/modelos.service';
import { ProductosService } from 'src/app/services/productos.service';
import { ProveedoresService } from 'src/app/services/proveedores.service';
import { DialogMarcasRepuestosComponent } from '../dialog-marcas/dialog-marcas.component';
import { DialogModelosRepuestosComponent } from '../dialog-modelos/dialog-modelos.component';
import { DialogAlmacenRepuestoComponent } from '../dialog-almacen-repuesto/dialog-almacen-repuesto.component';
import { dialog, enviroment } from 'src/app/enviroments/enviroments';
import { IproductoMarcas } from 'src/app/interface/iproductoMarcas ';
import { IproductoModelos } from 'src/app/interface/iproducto-modelos';
import { Iproducto } from 'src/app/interface/iproducto';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { DialogActualizarStockComponent } from '../dialog-actualizar-stock/dialog-actualizar-stock.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ImagenesService } from 'src/app/services/imagenes.service';


export interface IproductoAlmacenes {

  almProId: number,
  almacenId: number,
  productoId: number,
  stock: number
}

@Component({
  selector: 'app-editar-repuesto',
  templateUrl: './editar-repuesto.component.html',
  styleUrls: ['./editar-repuesto.component.css']
})
export class EditarRepuestoComponent implements OnInit {

  /*===========================================
  VARIABLE PARA EL CARGO
  ===========================================*/
  administrador = false;

  /*=================
Grupo de Controles
===================*/

  public f: FormGroup = this.form.group({
    numeroParte: ['', Validators.pattern(/[0-9a-zA-ZáéíóúñÁÉÍÓÚÑ ]{1,}/)],
    codPils: ['', [Validators.required, Validators.pattern(/[0-9a-zA-Z]{1,}/)]],
    presentacion: ['', Validators.required],
    nombre: ['', [Validators.required, Validators.pattern(/[0-9a-zA-ZáéíóúñÁÉÍÓÚÑ ]{1,}/)]],
    marca: [{ value: '', disabled: true }],
    modelo: [{ value: '', disabled: true }],
    precio: [{ value: '', disabled: !this.administrador }, Validators.required],
    precioTarjeta: [{ value: '', disabled: !this.administrador }],
    precioCompra: [],
    almacen: new FormArray([]),
    proveedor: [''],
    descripcion: [''],
    imagen: [],
    stockMinimo: ['', Validators.pattern('[0-9]*')],

  })

  /*===========================================
  Validación personalizada
  ===========================================*/
  get numeroParte() { return this.f.get('numeroParte') }
  get presentacion() { return this.f.get('presentacion') }
  get proveedor() { return this.f.get('proveedor') }
  get nombre() { return this.f.get('nombre') }
  get precio() { return this.f.get('precio') }
  get precioTarjetaControl() { return this.f.get('precioTarjeta') }
  get precioCompra() { return this.f.get('precioCompra') }
  get descripcion() { return this.f.get('descripcion') }
  get imagen() { return this.f.get('imagen') }
  get almacen() { return this.f.get('almacen') as any }

  get marca() { return this.f.get('marca') }
  get modelo() { return this.f.get('modelo') }
  get stockMinimo() { return this.f.get('stockMinimo') }
  get codPils() { return this.f.get('codPils') }




  /*===========================================
Variable que valida el envío del formulario
  ===========================================*/

  formSubmitted = false;

  /*===========================================
  Variable de precarga
  ===========================================*/

  loadData = false;

  /*===========================================
  Variable para la información auxiliar 
  ===========================================*/
  marcas: Imarca[] = [];
  modelos: Imodelo[] = [];
  almacenes: Ialmacen[] = [];
  proveedores: Iproveedor[] = [];


  /*===========================================
  Variables para guardar los diferentes  precios
  ===========================================*/

  precioTarjeta = 0;


  /*===========================================
  Variables para guardar el stock total
  ===========================================*/
  stockTotal = 0;

  /*===========================================
  Variable contador para almacenes duplicados
  ===========================================*/
  duplicadoAlmacen = 0;
  /*===========================================
  Variable para  los dialog a editar.
  ===========================================*/
  marcasRepuestos: any[] = [];
  modelosRepuestos: any[] = [];

  /*===========================================
  Variable  para el id del repuesto
  ===========================================*/
  idRepuesto = 0;

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
  Variable  para definir el estado del producto
  ===========================================*/
  visible = false;

  /*===========================================
  Variable que almacene la imagen temporal
  ===========================================*/

  imgTemp = "";
  uploadFile: any;
  nameImage = "";
  urlImagen = "";

  /*===========================================
  Listado de PRODUCTOS ALMACEN
  ===========================================*/
  lstproductoAlmacenes: any[] = [];

  /*===========================================
  variables para saber si el almacen tiene stock
  ===========================================*/
  disponibleStockAlmacen = false;
  idAlmacenConectado = 0;


  constructor(private activatedRoute: ActivatedRoute,
    private productosService: ProductosService,
    private form: FormBuilder,
    private marcasService: MarcasService,
    private modelosService: ModelosService,
    private almacenesService: AlmacenesService,
    private proveedoresService: ProveedoresService,
    private sanitizer: DomSanitizer,
    private imagenesService: ImagenesService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {

    //SABER EL USUARIO CONENTADO
    const usuario = JSON.parse(localStorage.getItem('usuario')!);
    usuario.cargo === "1"? this.administrador= true:this.administrador=false;
    this.idAlmacenConectado = usuario.almacen;

        // Suscribirse a cambios en la variable administrador
        this.f.get('precio')?.valueChanges.subscribe(value => {
          const precioControl = this.f.get('precio');
          const precioTarjetaControl = this.f.get('precioTarjeta');
    
          if (this.administrador) {
            precioControl?.enable();
            precioTarjetaControl?.enable();
          } else {
            precioControl?.disable();
            precioTarjetaControl?.disable();
          }
        });

    //CARGA DE DATOS INICIALES

    this.cargarListas();

    this.activatedRoute.params.subscribe((params) => {
      this.productosService.getItem(params["id"]).subscribe(resp => {
        this.idRepuesto = params["id"];
        this.numeroParte?.setValue(resp.data.proNumParte);
        this.presentacion?.setValue(resp.data.proPresentacion);
        this.proveedor?.setValue(resp.data.proProvId);
        this.nombre?.setValue(resp.data.proNombre);
        this.precio?.setValue(resp.data.proPvpEfectivo);
        this.precioCompra?.setValue(resp.data.proPrecioCompra);
        this.precioTarjetaControl?.setValue(resp.data.proPvpTarjeta)
        this.descripcion?.setValue(resp.data.proDescripcion);
        this.stockMinimo?.setValue(resp.data.proStockMinimo);
        this.codPils?.setValue(resp.data.proCodPils);
        this.marcasRepuestos = resp.data.marcas;
        this.modelosRepuestos = resp.data.modelos;
        this.imgTemp = resp.data.proUrlImagen;
        this.urlImagen = resp.data.proUrlImagen;
        if (resp.data.proEstado === 1) {
          this.visible = true;
        }

        /*===========================================
        Cargar datos que contengan listas en el formulario
        ===========================================*/
        resp.data.almacen.forEach((element: any) => {
          if (element.almacenId == this.idAlmacenConectado) {
            this.disponibleStockAlmacen = true;
          }

          this.almacen.push(this.form.group({
            almacen: [{ value: element.almacenId, disabled: true }, Validators.required],
            stock: [{ value: element.stock, disabled: !this.administrador }, Validators.required],
            almProId: element.almProId,
            almacenId: element.almacenId,
          }))
        });


        /*===========================
        Infomación de productoModelos  
        =============================*/

        let auxModelo: any[] = [];
        resp.data.modelos.forEach((m: any) => {
          const dataModelo: IproductoModelos = {
            proModId: m.proModId,
            idProducto: m.idProducto,
            idModelo: m.idModelo
          }
          this.productoModelos.push(dataModelo);

          auxModelo.push(m.idModelo)
        });
        this.modelo?.setValue(auxModelo);


        /*=========================================
            productoMarcas  
        ===========================================*/
        let auxMarca: any[] = [];
        resp.data.marcas.forEach((m: any) => {
          const dataMarca: IproductoMarcas = {
            proMarId: m.proMarId,
            idProducto: m.idProducto,
            idMarca: m.idMarca
          }
          this.productoMarcas.push(dataMarca);
          auxMarca.push(m.idMarca)
        });
        this.marca?.setValue(auxMarca);
      })
    })

  }

  /*=========================
  Función para cargar listas iniciales de modelos  y marcas
  ==============================*/
  cargarListas() {

    this.modelosService.getData().subscribe(
      resp => {
        this.modelos = resp.data;
      }
    )

    this.marcasService.getData().subscribe(
      resp => {
        this.marcas = resp.data;
      }
    )

    this.almacenesService.getData().subscribe(
      resp => {
        this.almacenes = resp.data;
      }
    )

    this.proveedoresService.getData().subscribe(
      resp => {
        this.proveedores = resp.data;
      }
    )

  }

  async editar() {


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
    Infomación en la interfaz de productoAlmacenes 
    ===========================================*/

    var auxAlmacenes = this.almacen.getRawValue();

    auxAlmacenes.forEach((elemet: any) => {
      this.stockTotal = this.stockTotal + elemet.stock;
      const dataAlmacen: IproductoAlmacenes = {
        almProId: Number(elemet.almProId),
        almacenId: elemet.almacenId,
        productoId: this.idRepuesto,
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
              const nombreImagenBorrar = functions.nombreImagen(this.urlImagen, 'Product');
              this.urlImagen = enviroment.urServidorImagen + res.data;
              this.imagenesService.deleteImage('Product', nombreImagenBorrar).subscribe(
                resp => {
                  resolve();
                }
              )
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

      proId: Number(this.idRepuesto),
      proNumParte: this.f.controls['numeroParte'].value,
      proNombre: this.f.controls['nombre'].value.toUpperCase(),
      proPrecioCompra: this.f.controls['precioCompra'].getRawValue(),
      proPvpEfectivo: this.f.controls['precio'].getRawValue(),
      proPvpTarjeta: this.f.controls['precioTarjeta'].getRawValue(),
      proDescripcion: this.f.controls['descripcion'].value,
      proPresentacion: this.f.controls['presentacion'].value,
      proUrlImagen: this.urlImagen,
      proEstado: this.visible ? 1 : 0,
      proStockTotal: this.stockTotal,
      proProvId: this.f.controls['proveedor'].value,
      proStockMinimo: this.f.controls['stockMinimo'].value,
      proCodPils: this.f.controls['codPils'].value,
      marcas: this.productoMarcas,
      modelos: this.productoModelos,
      almacen: this.productoAlmacenes
    }

    /*===========================================
    Guardar la informacion en base de datos
    =========================================*/

    this.productosService.putData(dataProducto).subscribe(
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

  /*=========================
  Validacion formulario
  ==============================*/

  invalidField(field: string) {
    return functions.invalidField(field, this.f, this.formSubmitted)
  }

  /*===============================
  Función para actualizar valor  los precios
  ================================*/
  cambioPrecio(e: any) {
    this.precioTarjeta = Math.ceil(e + (e * 0.05));
  }

  /*===============================
  Función para eliminar un almacen
  ================================*/

  eliminarAlmacen(i: any, almacen: any) {

    alerts.confirmAlert("¿ Estás seguro de eliminar ?", "La información ya no se puede recuperar", "warning", "Si, eliminar").then(
      (result) => {
        if (result.isConfirmed) {
          this.productosService.deleteDataAlmacen(almacen.almProId.toString()).subscribe(
            resp => {
              if (resp.exito === 1) {
                alerts.basicAlert("Eliminado", resp.mensaje, "success");
                this.almacen.removeAt(i);
                this.duplicadoAlmacen--;
              } else {
                alerts.basicAlert("Error", resp.mensaje, "error");
              }
            }
          )

        }
      }
    )
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

  /*===============================
  Función para editar las marcas
  ================================*/

  editMarca() {

    const dialogRef = this.dialog.open(DialogMarcasRepuestosComponent,
      {
        width: '50%',
        data: this.idRepuesto
      });

    /*===========================================
    Actualizar listado de la tabla
    ===========================================*/
    dialogRef.afterClosed().subscribe(result => {
      this.productosService.getItem(this.idRepuesto.toString()).subscribe(
        resp => {
          this.productoMarcas = [];
          let auxMarca: any[] = [];
          resp.data.marcas.forEach((m: any) => {
            const dataMarca: IproductoMarcas = {
              proMarId: m.proMarId,
              idProducto: m.idProducto,
              idMarca: m.idMarca
            }
            this.productoMarcas.push(dataMarca);
            auxMarca.push(m.idMarca)
          });
          this.marca?.setValue(auxMarca);
        }
      )
    });

  }


  /*===============================
  Función para editar los modelos
  ================================*/

  editModelo() {

    const dialogRef = this.dialog.open(DialogModelosRepuestosComponent,
      {
        width: '50%',
        data: this.idRepuesto
      });

    /*===========================================
    Actualizar listado de la tabla
    ===========================================*/
    dialogRef.afterClosed().subscribe(result => {
      this.productosService.getItem(this.idRepuesto.toString()).subscribe(
        resp => {
          this.productoModelos = [];
          let auxModelo: any[] = [];
          resp.data.modelos.forEach((m: any) => {
            const dataModelo: IproductoModelos = {
              proModId: m.proModId,
              idProducto: m.idProducto,
              idModelo: m.idModelo
            }
            this.productoModelos.push(dataModelo);

            auxModelo.push(m.idModelo)
          });
          this.modelo?.setValue(auxModelo);
        }
      )
    });

  }


  /*===============================
  Función para añadir un almacen
  ================================*/

  agregarAlmacen() {

    const dialogRef = this.dialog.open(DialogAlmacenRepuestoComponent, { width: dialog.tamaño, data: this.idRepuesto });
    /*===========================================
    Actualizar listado de la tabla
    ===========================================*/
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.almacen.clear();
        this.productosService.getItem(this.idRepuesto.toString()).subscribe(
          resp => {
            resp.data.almacen.forEach((element: any) => {
              this.almacen.push(this.form.group({
                almacen: [{ value: element.almacenId, disabled: true }, Validators.required],
                stock: [{ value: element.stock, disabled: !this.administrador }, Validators.required],
                almacenId: element.almacenId,
                almProId: element.almProId
              }))
            });
          }
        )
      }
    })

  }


  /*=========================
 Cambiar el estado del proveedor
  ==============================*/
  activo(event: MatSlideToggleChange) {
    this.visible = event.checked;
  }


  /*===============================
  Función para editar stock de los repuestos
  ================================*/

  editarStock() {

    const dialogRef = this.dialog.open(DialogActualizarStockComponent,
      {
        width: '100%',
        data: this.idRepuesto
      });

    /*===========================================
    Actualizar listado de la tabla
    ===========================================*/
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.almacen.clear();
        this.productosService.getItem(this.idRepuesto.toString()).subscribe(
          resp => {
            resp.data.almacen.forEach((element: any) => {
              this.almacen.push(this.form.group({
                almacen: [{ value: element.almacenId, disabled: true }, Validators.required],
                stock: [{ value: element.stock, disabled: !this.administrador }, Validators.required],
                almacenId: element.almacenId,
                almProId: element.almProId
              }))
            });
          }
        )
      }
    })

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



  /*===========================================
  Función para la seguridad de la URL
  ===========================================*/

  sanitizeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

}
