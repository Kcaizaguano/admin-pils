import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { functions } from 'src/app/helpers/functions';
import { Iproducto } from 'src/app/interface/iproducto';
import { ProductosService } from 'src/app/services/productos.service';
import { ModelosService } from 'src/app/services/modelos.service';
import { MarcasService } from 'src/app/services/marcas.service';
import { AlmacenesService } from 'src/app/services/almacenes.service';
import { Imarca } from 'src/app/interface/imarca';
import { Imodelo } from 'src/app/interface/imodelo';
import { Ialmacen } from 'src/app/interface/ialmacen';
import { IproductoAlmacen } from 'src/app/interface/iproducto-almacen';
import { Iproveedor } from 'src/app/interface/iproveedor';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-distribuido-rol',
  templateUrl: './distribuido-rol.component.html',
  styleUrls: ['./distribuido-rol.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ]
})
export class DistribuidoRolComponent implements OnInit {



  constructor(private productosService: ProductosService,
    private modelosService: ModelosService,
    private marcasService: MarcasService,
    private almacenesService: AlmacenesService,
    private sanitizer: DomSanitizer
    ) { }


  /*===========================================
  Variable global para nombrar columnas 
  ===========================================*/
  displayedColumns: string[] = ['codigo', 'stockTotal', 'acciones'];

  /*===========================================
  Variable global que instancie la Data que aparecera en la Tabla
  ===========================================*/

  dataSource!: MatTableDataSource<Iproducto>;


  /*===========================================
Variable global para informar a la vista cuadno hay una expancion en la tabla
===========================================*/

  expandedElement!: Iproducto | null;

  /*===========================================
Variable global para saber el tamaño de pantalla
===========================================*/

  pantallaCorta = false;

  /*===========================================
  Paginacion y Orden
  ===========================================*/

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  /*===========================================
Variable global para saber cuando fianliza la carga de los datos
===========================================*/
  loadData = false;


  /*===========================================
Variables globales de la interfaz de usuario
===========================================*/

  productos: Iproducto[] = [];
  marcas: Imarca[] = [];
  modelos: Imodelo[] = [];
  almacenes: Ialmacen[] = [];
  proveedores: Iproveedor[] = [];


  ngOnInit(): void {

    this.cargarListados();

    /*==================
    Cargar datos al iniciar 
    ======================*/

    this.getData();


    /*===========================================
    Definir el tamaño de pantalla
    ===========================================*/
    if (functions.dimencionPantalla(0, 767)) {
      this.pantallaCorta = true;
    } else {
      this.pantallaCorta = false;
      this.displayedColumns.splice(1, 0, 'nombre')
      this.displayedColumns.splice(2, 0, 'precio')

    }

  }


  /*====================================
  Función para cargar los listados  secundarios 
  ======================================*/

  cargarListados() {


    /*=======================
    Cargar listado de marcas  
    ======================*/

    this.almacenesService.getData().subscribe(
      resp => {
        this.almacenes = resp.data;

      }
    )

    /*=======================
      Cargar listado de marcas  
      ======================*/

    this.marcasService.getData().subscribe(
      resp => {
        this.marcas = resp.data;

      }
    )


    /*=======================
      Cargar listado de modelos  
      ======================*/

    this.modelosService.getData().subscribe(
      resp => {
        this.modelos = resp.data;

      }
    )




  }


  /*===========================================
  Función para tomar la data de los repuestos
  ===========================================*/
  getData() {

    this.loadData = true;


    this.productosService.getData().subscribe(
      resp => {

        this.productos = Object.keys(resp.data).map(a => ({
          


          proId: resp.data[a].proId,
          proNumParte: resp.data[a].proNumParte,
          proNombre: resp.data[a].proNombre,
          proPrecioCompra: resp.data[a].proPrecioCompra,
          proPvpEfectivo: resp.data[a].proPvpEfectivo,
          proPvpTarjeta: resp.data[a].proPvpTarjeta,
          proDescripcion: resp.data[a].proDescripcion,
          proPresentacion: resp.data[a].proPresentacion,
          proUrlImagen: resp.data[a].proUrlImagen,
          proEstado: resp.data[a].proEstado,
          proStockTotal: resp.data[a].proStockTotal,
          proProvId: resp.data[a].proProvId,
          proProveedor: "",
          proStockMinimo: resp.data[a].proStockMinimo,
          proCodPils: resp.data[a].proCodPils,
          modelos: this.obtenerModeloID(resp.data[a].modelos),
          marcas: this.obtenerMarcaID(resp.data[a].marcas),
          almacen: this.formatearAlmacen(resp.data[a].almacen),
          nombreCompleto: resp.data[a].proNombre+ ' '+this.obtenerMarcaID(resp.data[a].marcas)+' '+ this.obtenerModeloID(resp.data[a].modelos)


        } as Iproducto))
        
        console.log("this.productos: ", this.productos);



        this.dataSource = new MatTableDataSource(this.productos);
        this.dataSource.paginator = this.paginator;
        this.loadData = false;
      }
    )
  }

  /*========================================
Función para filtro de busqueda
===========================================*/

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

  }


  /*===========================================
Función  cambio de id por nombre de marcas 
===========================================*/

  obtenerMarcaID(lst: any) {
    let valores: string[] = [];

    for (let item of lst) {

      const objetoEncontrado = this.marcas.find((m) => m.marId === item.idMarca);

      if (objetoEncontrado) {

        valores.push(objetoEncontrado.marNombre);

      }
    }

    return valores;

  }

  /*===========================================
Función  cambio de id por nombre de  modelos
===========================================*/

  obtenerModeloID(lst: any) {
    let valores: string[] = [];

    for (let item of lst) {

      const objetoEncontrado = this.modelos.find((m) => m.modId === item.idModelo);

      if (objetoEncontrado) {

        valores.push(objetoEncontrado.modNombre);

      }
    }

    return valores;

  }


  /*===========================================
  Función  para formatear  los almacenes
  ===========================================*/

  formatearAlmacen(lst: any) {
    let valores: IproductoAlmacen[] = [];

    valores = Object.keys(lst).map(a => ({
      almProId: lst[a].almProId,
      almacenId: lst[a].almacenId,
      productoId: lst[a].productoId,
      stock: lst[a].stock,
      nombre: this.almacenes.find(item => item.almId === lst[a].almacenId)?.almNombre
    } as IproductoAlmacen))


    return valores;

  }


    /*===========================================
  Función para la seguridad de la URL
  ===========================================*/

  sanitizeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

}
