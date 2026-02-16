import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { alerts } from 'src/app/helpers/alerts';
import { functions } from 'src/app/helpers/functions';
import { Iproducto } from 'src/app/interface/iproducto';
import { IproductoMarcas } from 'src/app/interface/iproductoMarcas ';
import { MarcasService } from 'src/app/services/marcas.service';
import { ProductosService } from 'src/app/services/productos.service';

@Component({
  selector: 'app-dialog-marcas-repuestos',
  templateUrl: './dialog-marcas-repuestos.component.html',
  styleUrls: ['./dialog-marcas-repuestos.component.css'],
})
export class DialogMarcasRepuestosComponent implements OnInit {
  /*=================
  Grupo de Controles
  ===================*/

  public f: FormGroup = this.form.group({
    marca: [
      '',
      {
        validators: Validators.required,
        asyncValidators: [this.validarMarcaRepetida()],
        updateOn: 'blur',
      },
    ],
  });

  /*==========================
  Validación personalizada
  ================================*/

  get marca() {
    return this.f.get('marca');
  }

  /*===========================================
  Variable que valida el envío del formulario
    ===========================================*/

  formSubmitted = false;

  /*===========================================
  Variable para precara
  ===========================================*/

  loadData = false;

  /*===========================================
  Variable global para nombrar columnas 
  ===========================================*/
  displayedColumns: string[] = ['id', 'marca', 'acciones'];

  /*===========================================
  Variable global que instancie la Data que aparecera en la Tabla
  ===========================================*/

  dataSource!: MatTableDataSource<IproductoMarcas>;

  /*===========================================
  Paginacion y Orden
  ===========================================*/

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  /*===========================================
  Variables globales de la interfaz de usuario
  ===========================================*/

  marcas: IproductoMarcas[] = [];
  lstmarca: any[] = [];

  /*===========================================
  Variable para el id del producto 
  ===========================================*/

  producto: Iproducto;

  constructor(
    private form: FormBuilder,
    public dialogRef: MatDialogRef<DialogMarcasRepuestosComponent>,
    public marcasService: MarcasService,
    public productosService: ProductosService,
    @Inject(MAT_DIALOG_DATA) public productoSelecciona: any,
  ) {
    this.producto = productoSelecciona;
  }

  /*==================
Cargar datos al iniciar 
======================*/
  async ngOnInit(): Promise<void> {
    this.lstmarca = await functions.verificacionMarcas(this.marcasService);
    this.getData();
  }

  /*===========================================
  Función para tomar la data de las ciudades
  ===========================================*/
  getData() {
    this.marcas = Object.keys(this.producto.marcas).map(
      (a) =>
        ({
          proMarId: this.producto.marcas[a].proMarId,
          idProducto: this.producto.marcas[a].idProducto,
          idMarca: this.producto.marcas[a].idMarca,
          nombre: this.lstmarca.find(
            (m) => m.marId === this.producto.marcas[a].idMarca,
          )?.marNombre,
        }) as IproductoMarcas,
    );
    this.dataSource = new MatTableDataSource(this.marcas);
    this.dataSource.paginator = this.paginator;
    this.loadData = false;
  }

  /*=========================
  Validacion formulario
  ==============================*/

  invalidField(field: string) {
    return functions.invalidField(field, this.f, this.formSubmitted);
  }

  deleteMarca(marca: IproductoMarcas) {
    alerts
      .confirmAlertSecondary(
        '¿ Estás seguro de eliminar ?',
        'La información ya no se puede recuperar',
        'warning',
        'Si, eliminar',
        this.dialogRef.id,
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.productosService
            .deleteDataMarca(marca.proMarId)
            .subscribe((resp) => {
              if (resp.exito === 1) {
                // alert(resp.mensaje);
                this.producto.marcas = this.producto.marcas.filter((m: { proMarId: number; }) => m.proMarId != marca.proMarId)
                this.getData();
              } else {
                alert(resp.mensaje);
              }
            });
        }
      });
  }

  guardar() {
    /*===========================================
    Validando que el formulario si se lo envio 
    ===========================================*/
    this.formSubmitted = true;

    if (this.f.invalid) {
      return;
    }

    this.loadData = true;

    /*===========================================
    Capturar la información del formulario en la Interfaz
    =========================================*/

    const dataproductoMarcas: IproductoMarcas = {
      proMarId: 0,
      idProducto: this.producto.proId,
      idMarca: this.f.controls['marca'].value,
    };

    /*===========================================
    Guardar información en la base de datos
    =========================================*/

    this.productosService.postMarcaData(dataproductoMarcas).subscribe((resp) => {
        if (resp.exito === 1) {
          this.loadData = false;
            this.productosService.getItem(this.producto.proId.toString()).subscribe(
              resp2 => {
                this.producto = resp2.data;
                this.getData();
              }
            )
          this.f.controls['marca'].setValue(' ');
        } else {
          this.loadData = false;
        }
      });

  }

  /*===========================================
  Validar que la marca no se repita
  ===========================================*/
  validarMarcaRepetida() {
    return (control: AbstractControl) => {
      const marca = control.value;

      return new Promise((resolve) => {
        var marcaRepetida = false;
        this.marcas.forEach((element) => {
          if (element.idMarca == marca) {
            marcaRepetida = true;
          }
        });

        if (marcaRepetida) {
          resolve({ marcaRepetida: true });
        }

        resolve(false);
      });
    };
  }

  /*===========================================
  Cerrar Dialog
  ===========================================*/
cerrarDialog() {
  this.dialogRef.close(this.producto);
}


}
