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
import { dialog } from 'src/app/enviroments/enviroments';
import { IproductoMarcas } from 'src/app/interface/iproductoMarcas ';
import { IproductoModelos } from 'src/app/interface/iproducto-modelos';
import { Iproducto } from 'src/app/interface/iproducto';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { DialogActualizarStockComponent } from '../dialog-actualizar-stock/dialog-actualizar-stock.component';


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
    precio: ['', Validators.required],
    precioCompra: [],
    precioTarjeta: [],
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

  constructor(private activatedRoute: ActivatedRoute,
    private productosService: ProductosService,
    private form: FormBuilder,
    private marcasService: MarcasService,
    private modelosService: ModelosService,
    private almacenesService: AlmacenesService,
    private proveedoresService: ProveedoresService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {

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
        this.imagen?.setValue(resp.data.proUrlImagen);
        this.stockMinimo?.setValue(resp.data.proStockMinimo);
        this.codPils?.setValue(resp.data.proCodPils);
        this.marcasRepuestos = resp.data.marcas;
        this.modelosRepuestos = resp.data.modelos;
        if (resp.data.proEstado === 1) {
          this.visible = true;
        }

        /*===========================================
        Cargar datos que contengan listas en el formulario
        ===========================================*/
        resp.data.almacen.forEach((element: any) => {
          this.almacen.push(this.form.group({
            almacen: [{ value: element.almacenId, disabled: true }, Validators.required],
            stock: [ element.stock , Validators.required],
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

  editar() {


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

    var auxAlmacenes = this.almacen.value;
    console.log("auxAlmacenes: ", auxAlmacenes);

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


    /*=================================================================
    Capturar la información del formulario del formulario en la interfaz
    ===================================================================*/
    const dataProducto: Iproducto = {

      proId: Number(this.idRepuesto),
      proNumParte: this.f.controls['numeroParte'].value,
      proNombre: this.f.controls['nombre'].value.toUpperCase(),
      proPrecioCompra: this.f.controls['precioCompra'].value,
      proPvpEfectivo: this.f.controls['precio'].value,
      proPvpTarjeta: this.f.controls['precioTarjeta'].value,
      proDescripcion: this.f.controls['descripcion'].value,
      proPresentacion: this.f.controls['presentacion'].value,
      proUrlImagen: this.f.controls['imagen'].value,
      proEstado: this.visible ? 1 : 0,
      proStockTotal: this.stockTotal,
      proProvId: this.f.controls['proveedor'].value,
      proStockMinimo: this.f.controls['stockMinimo'].value,
      proCodPils: this.f.controls['codPils'].value,
      marcas: this.productoMarcas,
      modelos: this.productoModelos,
      almacen: this.productoAlmacenes
    }

    console.log("dataProducto: ", dataProducto);



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
                stock: [element.stock, Validators.required],
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
        width: '50%',
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
                stock: [element.stock, Validators.required],
                almacenId: element.almacenId

              }))
            });
          }
        )
      }
    })

  }

}
