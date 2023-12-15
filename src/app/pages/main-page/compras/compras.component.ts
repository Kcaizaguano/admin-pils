import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Icompra } from 'src/app/interface/icompra';
import { ComprasService } from 'src/app/services/compras.service';
import { Router } from '@angular/router';
import { alerts } from 'src/app/helpers/alerts';
import { ProveedoresService } from 'src/app/services/proveedores.service';
import { Iproveedor } from 'src/app/interface/iproveedor';

@Component({
  selector: 'app-compras',
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ]
})
export class ComprasComponent implements OnInit {

  
  /*===========================================
  Variable global para nombrar columnas 
  ===========================================*/
  displayedColumns: string[] = ['id', 'fecha','proveedor','total','acciones'];

  /*===========================================
  Variable global que instancie la Data que aparecera en la Tabla
  ===========================================*/

  dataSource!: MatTableDataSource<Icompra>;

  /*===========================================
Variable global para informar a la vista cuadno hay una expancion en la tabla
===========================================*/

  expandedElement!: Icompra | null;

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

  compras: Icompra[] = [];
  proveedores: Iproveedor[] = [];


  constructor ( private comprasService:ComprasService,
    private proveedoresService:ProveedoresService,
    private router:Router){}


    ngOnInit(): void {

      this.proveedoresService.getData().subscribe(
        resp => {
          this.proveedores = resp.data;
        }
      )
  
      this.getData();
      
    }

  /*===========================================
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
  Función para tomar la data de las cotizaciones
  ===========================================*/
  getData() {

    this.loadData= true;

    this.comprasService.getData().subscribe(
      resp => {

        this.compras = Object.keys(resp.data).map(a => ({

          comId:   resp.data[a].comId,
          comNumOrden: resp.data[a].comNumOrden,
          comFecha: resp.data[a].comFecha,
          comProveedor : resp.data[a].comProveedor,
          nombreProveedor:this.proveedores.find(p => p.proId ===  resp.data[a].comProveedor )?.proNombre,
          comDescripcion : resp.data[a].comDescripcion,
          comTotal: resp.data[a].comTotal,
          detalles : resp.data[a].detalles

        } as Icompra))



        this.dataSource = new MatTableDataSource(this.compras);
        this.dataSource.paginator = this.paginator;
        this.loadData= false;
      }
    )
  }

  editar(elemento : any){
    this.router.navigate(['compras/nueva-compra',elemento.comId])
  }

  nuevaCompra(){
    this.router.navigate(['compras/nueva-compra',0])
  }

  deleteCotizacion(compra : Icompra){

    alerts.confirmAlert("¿ Estás seguro de eliminar ?", "La información ya no se puede recuperar","warning","Si, eliminar").then(
      (result)=> {
        if (result.isConfirmed) {
          this.comprasService.deleteData(compra.comId).subscribe(
            resp =>{
              if (resp.exito === 1) {
                alerts.basicAlert("Eliminado", resp.mensaje ,"success" );
                this.getData();
              }else{
                alerts.basicAlert("Error", resp.mensaje ,"error" );
              }
            }
          )
          
        }
      }
    )

  }
}
