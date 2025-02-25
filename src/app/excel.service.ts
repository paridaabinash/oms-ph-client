import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor(private appservice: AppService) { }

  generateExcel(type: string, columns: any[], data: any[], heading: string, fileName: string): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    
    let cur_date_string = this.appservice.getDateTimeString()

    // Add headers
    worksheet.addRow([heading]);
    let header_cell = worksheet.getCell(1, 1);
    header_cell.alignment = { horizontal: type == 'single' ? 'center' : 'left', vertical: "middle" };
    header_cell.font = { bold: true, size: 18 };

    worksheet.addRow([]);
    worksheet.addRow(["Export Time: " + cur_date_string]);
    let date_cell = worksheet.getCell(3, 1);
    date_cell.alignment = { horizontal: type == 'single' ? 'center' : 'left' };
    date_cell.font = { italic: true };

    let multi_header = [];
    if (type == 'multi') {
      multi_header = columns.filter(col => !col.heading).map(col => col.name);
    }
    worksheet.mergeCells(1, 1, 2, type == 'single' ? 2 : multi_header.length);
    worksheet.mergeCells(3, 1, 3, type == 'single' ? 2 : multi_header.length);


    // Add data
    if (type == "single") {
      let maxLength1 = 0;
      let maxLength2 = 0;
      for (let column of columns) {
        if (column.heading)
          continue;
        const cellValue1 = column.name ?? '';
        const cellValue2 = data[column.colname]?.toString() ?? '';
        maxLength1 = Math.max(maxLength1, cellValue1.length);
        maxLength2 = Math.max(maxLength2, cellValue2.length);
        worksheet.addRow([column.name, data[column.colname]])
      }
      worksheet.columns[0].width = maxLength1 + 2;
      worksheet.columns[1].width = maxLength2 + 2;
    }
    else {
      let col_len = Array(multi_header.length).fill(0);
      let final_row: any[] = [], col_ind = 0;
      worksheet.addRow(multi_header).eachCell(cell => cell.style.font = { bold: true });

      for (let row of data) {
        final_row = [];
        col_ind = 0;
        for (let col = 0; col < columns.length; col++) {
          if (columns[col].heading)
            continue;
          let col_name = columns[col].colname;
          let val = row[col_name]?.toString() ?? "";
          final_row.push(val);

          let c_len = multi_header[col_ind].length, v_len = val.length;
          c_len += (multi_header[col_ind].match(/[A-Z]/g) || []).length;
          v_len += (val.match(/[A-Z]/g) || []).length;

          let len = Math.max(c_len, v_len);
          if (col_len[col_ind] < len) {
            col_len[col_ind] = len + 2;
          }
          col_ind++;
        }
        worksheet.addRow(final_row);
      }
      worksheet.columns.forEach((col, ind) => {
        col.width = col_len[ind];
      });
    }


    // Save the workbook to a blob
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${fileName}.xlsx`);
    });
  }
}
