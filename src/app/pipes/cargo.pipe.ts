import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cargo'
})
export class CargoPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case "1":
        return 'Administrador';
      case "2":
        return 'Vendedor';
        case "3":
          return 'Bodeguero';
      default:
        return 'Desconocido';
    }
  }

}
