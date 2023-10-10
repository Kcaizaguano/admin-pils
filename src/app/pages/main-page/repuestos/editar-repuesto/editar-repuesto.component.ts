import { Component , OnInit} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
    numeroParte: ['', [Validators.required, Validators.pattern(/[0-9a-zA-ZáéíóúñÁÉÍÓÚÑ ]{1,}/)]],
    presentacion: ['', Validators.required],
    nombre: ['', [Validators.required, Validators.pattern(/[0-9a-zA-ZáéíóúñÁÉÍÓÚÑ ]{1,}/)]],
    marca: [''],
    modelo: [''],
    precio: ['', Validators.required],
    precioCompra: [0],
    almacen: new FormArray([]),
    proveedor: [''],
    descripcion: [''],
    imagen: []
  })

  /*===========================================
  Validación personalizada
  ===========================================*/
  get numeroParte() { return this.f.get('numeroParte') }
  get presentacion() { return this.f.get('presentacion') }
  get proveedor() { return this.f.get('proveedor') }
  get nombre() { return this.f.get('nombre') }
  get precio() { return this.f.get('precio') }
  get precioCompra() { return this.f.get('precioCompra') }
  get descripcion() { return this.f.get('descripcion') }
  get imagen() { return this.f.get('imagen') }
  get almacen() { return this.f.get('almacen') as any }
  get marca() { return this.f.get('marca') }
  get modelo() { return this.f.get('modelo') }


    /*===========================================
  Variable que valida el envío del formulario
    ===========================================*/

    formSubmitted = false;

    /*===========================================
    Variable de precarga
    ===========================================*/
  
    loadData = false;

  /*===========================================
  Variable para la información de marcas y modelos
  ===========================================*/
  marcas: Imarca[] = [];
  modelos: Imodelo[] = [];
  almacenes: Ialmacen[] = [];
  proveedores: Iproveedor[] = [];


  /*===========================================
  Variables para guardar los diferentes  precios
  ===========================================*/

  precioTarjeta = 0;
  precioMayorEfectivo = 0;
  precioMayorTarjeta = 0;

  /*===========================================
  Variables para guardar el stock total
  ===========================================*/
  stockTotal = 0;



  constructor( private activatedRoute:ActivatedRoute,
              private productosService: ProductosService,
              private form: FormBuilder,
              private marcasService: MarcasService,
              private modelosService: ModelosService,
              private almacenesService: AlmacenesService,
              private proveedoresService: ProveedoresService,
              ){}

  ngOnInit(): void {

    this.cargarListas();

    this.activatedRoute.params.subscribe((params) =>{
      this.productosService.getItem(params["id"]).subscribe(resp => {
        console.log("resp: ", resp);
        this.numeroParte?.setValue(resp.data.proNumParte);
        this.presentacion?.setValue(resp.data.proPresentacion);
        this.proveedor?.setValue(resp.data.proProvId);
        this.nombre?.setValue(resp.data.proNombre);
        this.precio?.setValue(resp.data.proPvpEfectivo);
        this.precioCompra?.setValue(resp.data.proPrecioCompra);
        this.precioTarjeta = resp.data.proPvpTarjeta;
        this.precioMayorEfectivo = resp.data.proPvMayEfectivo;
        this.precioMayorTarjeta = resp.data.proPvMayTarjeta;
        this.descripcion?.setValue(resp.data.proDescripcion);
        this.imagen?.setValue(resp.data.proUrlImagen);




        /*===========================================
        Cargar datos que contengan listas en el formulario
        ===========================================*/

        resp.data.almacen.forEach((element: any) => {
          this.almacen.push(this.form.group({
            almacenId: [{value:element.almacenId,disabled: true}, Validators.required],
            ubicacion: [element.proCodUbicacion, Validators.required],
            stock: [element.stock, Validators.required]
          }))
        });

        let auxModelo: any []=[];
        resp.data.modelos.forEach((m : any) => {
          auxModelo.push(m.idModelo)
        });
        this.modelo?.setValue(auxModelo);


        let auxMarca: any []=[];
        resp.data.marcas.forEach((m : any) => {
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

  editar(){

    
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
    this.precioMayorEfectivo = Math.ceil(e - (e * 0.4));
    this.precioMayorTarjeta = Math.ceil(this.precioMayorEfectivo + (this.precioMayorEfectivo * 0.05))

  }

  /*===============================
  Función para eliminar un almacen
  ================================*/

  eliminarAlmacen(i: any) {

    this.almacen.removeAt(i);

  }

    /*===============================
  Función para añadir un almacen
  ================================*/

  addAlmacen() {

    this.almacen.push(this.form.group({
      almacenId: ['', Validators.required],
      ubicacion: ['', Validators.required],
      stock: ['', Validators.required]
    }))
  }

}