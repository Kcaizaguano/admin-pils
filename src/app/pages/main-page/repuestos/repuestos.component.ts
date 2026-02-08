import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { functions } from 'src/app/helpers/functions';
import { Iproducto } from 'src/app/interface/iproducto';
import { ProductosService } from 'src/app/services/productos.service';
import { alerts } from 'src/app/helpers/alerts';
import { FormControl } from '@angular/forms';
import { DialogActualizarStockComponent } from './dialog-actualizar-stock/dialog-actualizar-stock.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ImagenesService } from 'src/app/services/imagenes.service';
import { IproductoFilter } from 'src/app/interface/iproductoFilter';
import { Imodelo } from 'src/app/interface/imodelo';
import { ModelosService } from 'src/app/services/modelos.service';
import { Imarca } from 'src/app/interface/imarca';
import { MarcasService } from 'src/app/services/marcas.service';
import { Ialmacen } from 'src/app/interface/ialmacen';
import { AlmacenesService } from 'src/app/services/almacenes.service';


@Component({
  selector: 'app-repuestos',
  templateUrl: './repuestos.component.html',
  styleUrls: ['./repuestos.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ]
})
export class RepuestosComponent implements OnInit {
  modelosSeleccionado: any;
  marcaSeleccionada: any;
  codigo: any;
  modelos: Imodelo[] = [];
  marcas: Imarca[] = [];
  almacenes: Ialmacen[] = [];
  nombreBusqueda: any;
  numeroElementos :any;

  constructor(private productosService: ProductosService,
    private imagenesService:ImagenesService,
    private sanitizer: DomSanitizer,
    private modeloServices: ModelosService,
    private marcaServices: MarcasService,
    private alamcenServices : AlmacenesService,
    public dialog: MatDialog) { }


  /*===========================================
  Variable global para nombrar columnas 
  ===========================================*/
  displayedColumns: string[] = ['proCodPils', 'proStockTotal', 'acciones'];

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
  @ViewChild(MatSort) sort!: MatSort;

  /*===========================================
Variable global para saber cuando fianliza la carga de los datos
===========================================*/
  loadData = false;


  /*===========================================
Variables globales de la interfaz de usuario
===========================================*/

  productos: Iproducto[] = [];

  /*===========================================
  Variable  para saber si es transferencia de un local
  ===========================================*/
  checkboxControl = new FormControl(false);

  /*===========================================
  Variable  para saber si es adminstrador
  ===========================================*/
  administrador= false;

  async ngOnInit(): Promise<void> {

  //SABER EL USUARIO CONENTADO
  const usuario = JSON.parse(localStorage.getItem('usuario')!);
  usuario.cargo == "1"? this.administrador= true:this.administrador=false;
    this.numeroElementos = 10;
    this.getFilterData();
    /*===========================================
    Definir el tamaño de pantalla
    ===========================================*/
    if (functions.dimencionPantalla(0, 767)) {
      this.pantallaCorta = true;
    } else {
      this.pantallaCorta = false;
      this.displayedColumns.splice(1, 0, 'proNombre')
     // this.displayedColumns.splice(2, 0, 'marca')
      //this.displayedColumns.splice(3, 0, 'modelo')
      this.displayedColumns.splice(2, 0, 'precio')
    }

    this.modelos = await functions.verificacionModelos(this.modeloServices);
    this.marcas  = await  functions.verificacionMarcas(this.marcaServices);
    this.almacenes = await functions.verificacionAlmacenes(this.alamcenServices);
  }


   /*===========================================
  Función para tomar la data filtrada
  ===========================================*/
  getFilterData() {

    this.loadData = true;
    let filtroProductos : IproductoFilter = 
    {
        IdMarca :this.marcaSeleccionada,
        IdModelo :this.modelosSeleccionado,
        IdAlmacen :null,
        Nombre :this.nombreBusqueda,
        CodigoPils :this.codigo,
        NumeroElementos : this.numeroElementos
    };

    this.productosService.getFilterData(filtroProductos).subscribe(
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
          proProveedor: '',
          proStockMinimo: resp.data[a].proStockMinimo,
          proCodPils: resp.data[a].proCodPils,
          modelos: resp.data[a].modelo,
          marcas:  resp.data[a].marca,
          almacen: resp.data[a].almacenes,
          nombreCompleto: resp.data[a].proNombre+ ' '+functions.obtenerPorPropiedad(resp.data[a].marca, 'marNombre')+' '+ functions.obtenerPorPropiedad(resp.data[a].modelo, 'modNombre')

        } as Iproducto))


        this.dataSource = new MatTableDataSource(this.productos);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loadData = false;
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
          proProveedor: '',
          proStockMinimo: resp.data[a].proStockMinimo,
          proCodPils: resp.data[a].proCodPils,
          modelos: functions.obtenerModeloID(resp.data[a].modelos),
          marcas: functions.obtenerMarcaID(resp.data[a].marcas),
          almacen: resp.data[a].almacen,
          nombreCompleto: resp.data[a].proNombre+ ' '+functions.obtenerMarcaID(resp.data[a].marcas)+' '+ functions.obtenerModeloID(resp.data[a].modelos)

        } as Iproducto))


        this.dataSource = new MatTableDataSource(this.productos);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
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
  Función  para elminar repuesto
  ===========================================*/

  deleteRepuesto(producto: Iproducto) {
    alerts.confirmAlert("¿ Estás seguro de eliminar ?", "La información ya no se puede recuperar", "warning", "Si, eliminar").then(
      (result) => {
        if (result.isConfirmed) {
          this.productosService.deleteData(producto.proId).subscribe(
            resp => {
              if (resp.exito === 1) {
                if (producto.proUrlImagen != null || producto.proUrlImagen != '') {
                  this.imagenesService.deleteImage('Product',functions.nombreImagen(producto.proUrlImagen,'Product')).subscribe(
                    resp => {

                    }
                  )
                }
                alerts.basicAlert("Eliminado", resp.mensaje, "success");
                this.getData();
              } else {
                alerts.basicAlert("Error", resp.mensaje, "error");
              }
            }
          )

        }
      }
    )

  }


  /*===========================================
  Función  para ingreso masivo
  ===========================================*/

  ingresoRapido(producto: Iproducto) {

    const dialogRef = this.dialog.open(DialogActualizarStockComponent,
      {
        width: '100%',
        data: producto
      });

    /*===========================================
    Actualizar listado de la tabla
    ===========================================*/
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getData();
      }
    })

  }


    /*===========================================
  Función para la seguridad de la URL
  ===========================================*/

  sanitizeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /*===========================================
  Limpieza de filtros
  ===========================================*/
  limpiarFiltros(){
    this.codigo  = null;
    this.modelosSeleccionado = null;
    this.marcaSeleccionada = null;
    this.nombreBusqueda = "";
  }

}
