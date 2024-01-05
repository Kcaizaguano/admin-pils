import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cargo'
})
export class CargoPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case "1":
        return 'ADMINISTRADOR';
      case "2":
        return 'EMPLEADO';
        case "3":
          return 'DISTRIBUIDOR';
      default:
        return 'Desconocido';
    }
  }

}
