import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

export interface ICustomHeader {
  name: string;
  key: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentosService {

constructor() { }


generarExcel(customHeaders: ICustomHeader[], data: any[], filename: string) {
  let worksheetData: any[] = [];

  Object(data).forEach( (item: any) => {
    let worksheetItem = Object();
    customHeaders.forEach( header => {
      worksheetItem[header.name] = item[header.key];
    })
    worksheetData.push(worksheetItem)
  })

  // excel file
  let workbook = XLSX.utils.book_new();
  let worksheet = XLSX.utils.json_to_sheet(worksheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Hoja 1")
  XLSX.writeFileXLSX(workbook, filename, {});
}

}
