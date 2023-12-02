import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
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
import { ProveedoresService } from 'src/app/services/proveedores.service';
import { Iproveedor } from 'src/app/interface/iproveedor';
import { alerts } from 'src/app/helpers/alerts';
import { FormControl } from '@angular/forms';
import { DialogActualizarStockComponent } from './dialog-actualizar-stock/dialog-actualizar-stock.component';


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


  constructor(private productosService: ProductosService,
    private modelosService: ModelosService,
    private marcasService: MarcasService,
    private almacenesService: AlmacenesService,
    private proveedoresService: ProveedoresService,
    public dialog: MatDialog) { }


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
  @ViewChild(MatSort) sort!: MatSort;

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



  /*===========================================
  Variable  para saber si es transferencia de un local
  ===========================================*/
  checkboxControl = new FormControl(false);



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
      this.displayedColumns.splice(2, 0, 'marca')
      this.displayedColumns.splice(3, 0, 'modelo')
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



    /*=======================
    Cargar listado de  proveedores
    ======================*/

    this.proveedoresService.getData().subscribe(
      resp => {
        this.proveedores = resp.data;

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
          proProveedor: this.proveedores.find(p => p.proId === resp.data[a].proProvId)?.proNombre,
          proStockMinimo: resp.data[a].proStockMinimo,
          proCodPils: resp.data[a].proCodPils,
          modelos: this.obtenerModeloID(resp.data[a].modelos),
          marcas: this.obtenerMarcaID(resp.data[a].marcas),
          almacen: this.formatearAlmacen(resp.data[a].almacen)

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
  Función  para elminar repuesto
  ===========================================*/

  deleteRepuesto(producto: Iproducto) {
    alerts.confirmAlert("¿ Estás seguro de eliminar ?", "La información ya no se puede recuperar", "warning", "Si, eliminar").then(
      (result) => {
        if (result.isConfirmed) {
          this.productosService.deleteData(producto.proId).subscribe(
            resp => {
              if (resp.exito === 1) {
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
        width: '50%',
        data: producto.proId
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



}
