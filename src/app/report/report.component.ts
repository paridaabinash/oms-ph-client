import { Component, OnInit, Input, SimpleChanges, ViewChild } from '@angular/core';
import { AppService } from '../app.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDlgComponent } from '../common/confirmation-dlg/confirmation-dlg.component';
import { ReportAddUpdateDlgComponent } from './report-add-update-dlg/report-add-update-dlg.component';
import { lastValueFrom, Observable } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ExcelService } from '../excel.service';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
  providers: [DatePipe]
})
export class ReportComponent implements OnInit {
  @Input() type: string = '';
  @Input() displayedColumns: any[] = [];
  @Input() staticDS: any[] = [];
  @Input() isStatic: boolean = false;
  reportDataSource: MatTableDataSource<any>;
  saving = false;
  exportHeader: string = "";
  allFilters: string = "";
  displayAllCol: boolean = false; // reports all columns will be visible
  debounceSearch: Function;
  reportType = new FormControl<string>("Pending");
  range = new FormGroup({
    start: new FormControl<Date | null>(new Date(Date.now() - (86400000 * 30))),
    end: new FormControl<Date | null>(new Date()),
  });

  @ViewChild("report_table", { read: MatSort, static: true }) set smatSort(ms: MatSort) {
    this.reportDataSource.sort = ms;
    this.reportDataSource.data = this.reportDataSource.data.slice();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["staticDS"]) {
      this.reportDataSource.data = changes["staticDS"].currentValue;
      this.exportHeader = this.setExportHeaders()
    }
      
  }
  constructor(public appservice: AppService,
    private sb: MatSnackBar,
    private dialog: MatDialog,
    private excelService: ExcelService,
    private datePipe: DatePipe
    ) {
    this.debounceSearch = this.appservice.debounceSearch(this.applyFilter.bind(this), 300);
    this.reportDataSource = new MatTableDataSource<any>([]);

    
      this.reportDataSource.filterPredicate = (data: any, filter: string) => {
        const lowerCaseFilter = filter.toLowerCase();
        if (this.type == 'order_report') {
          return (
            data.brand_name.toLowerCase().startsWith(lowerCaseFilter)
          );
        } else 
          return JSON.stringify(data).toLowerCase().includes(lowerCaseFilter);
      };
    
  }

  setExportHeaders() {
    const exportHeaders: Record<string, string> = {
      'order_report': 'Order Report',
      'art_report': 'Art Report',
      'rm_report': 'RM Report',
      'pm_report': 'PM Report',
      'ppic_wo': 'Work Order wise RM/PM PPIC',
      'ppic_all_rm': 'All RM/PM PPIC',
      'ppic_all_pm': 'All RM/PM PPIC'
    };
    return exportHeaders[this.type];
  }

  async ngOnInit() {

    if (this.isStatic) {
      this.reportDataSource.data = this.staticDS;
      this.exportHeader = this.reportDataSource.data.length > 0 ? this.setExportHeaders() : "";
      return;
    }
    this.saving = true;

    let reportMappings: Record<string, string> = {
      'order_report': 'pendingOrders',
      'art_report': 'pendingArtReport',
      'rm_report': 'pendingRmReport',
      'pm_report': 'pendingPmReport'
    };

    

    const masterMappings: Record<string, string> = {
      'composition_master': 'compositionMaster',
      'packaging_master': 'packagingMaster',
      'rm_master': 'rmMaster',
      'pm_stock_master': 'pmStockMaster',
      'brand_master': 'brandStockMaster',
    };
    if (this.reportType.value == "Completed") {
      reportMappings = {
        'order_report': 'completedOrders',
        'art_report': 'completedArtReport',
        'rm_report': 'completedRmReport',
        'pm_report': 'completedPmReport'
      };
    }
    this.allFilters = this.setExportHeaders();

    let getall: Observable<any>;
    if (reportMappings[this.type]) {
      let range = { start: this.range.value.start?.getTime(), end: this.range.value.end?.getTime() }
      getall = this.appservice.GetAllFilterReports(reportMappings[this.type], true, range);
    } else if (masterMappings[this.type]) {
      getall = this.appservice.GetAllLinkingMaster(masterMappings[this.type]);
    } else {
      throw new Error('Invalid report type');
    }

    try {
      const response = await lastValueFrom(getall);
      if (response) {
        this.reportDataSource.data = (response as any[]).map(res => res.doc);
      }
      this.exportHeader = this.reportDataSource.data.length > 0 ? this.setExportHeaders() : "";

      this.saving = false;
    } catch (error) {
      this.sb.open("Could not fetch All Reports", "", {
        duration: 2000
      });
      this.saving = false;
    }
  }

  addRow() {
    let height = '100%';
    switch (this.type) {
      case 'composition_master':
      case 'rm_master':
      case 'under_test_stock_report':
      case 'pm_stock_master':
      case 'packaging_master': height = 'auto'; break;
      case 'brand_master': height = '100%'; break;
    }

    this.dialog.open(ReportAddUpdateDlgComponent, {
      width: '90%', height: height, data: { ds: this.displayedColumns, type: this.type }, autoFocus: false
    }).afterClosed().subscribe(res => {
      if (res) {
        this.reportDataSource.data.unshift(res);
        this.reportDataSource.data = this.reportDataSource.data.slice();
      }
    });
  }
  updateRow(row: any, index: number) {
    let height = '100%';
    switch (this.type) {
      case 'composition_master':
      case 'rm_master':
      case 'under_test_stock_report':
      case 'pm_stock_master':
      case 'packaging_master': height = 'auto'; break;
      case 'brand_master': height = '100%'; break;
    }
    this.dialog.open(ReportAddUpdateDlgComponent, {
      width: '90%', height: height, data: { row, ds: this.displayedColumns, type: this.type, reportType: this.reportType.value }, autoFocus: false
    }).afterClosed().subscribe(res => {
      if (res) {
        if ((this.type == "order_report" && res.order_status == "Completed") || ((this.type == "rm_master" || this.type == "pm_stock_master") && res.pending == 0))
          this.reportDataSource.data.splice(index, 1);
        else
          this.reportDataSource.data.splice(index, 1, res);
        this.reportDataSource.data = this.reportDataSource.data.slice();
      }
    });
  }
  deleteRow(row: any, index: number) {
    this.dialog.open(ConfirmationDlgComponent, {
      width: '250px', closeOnNavigation: true, autoFocus: true,
      data: {
        Question: "Are you Sure..! Do you want to Delete this Entry?",
        YesText: "Yes",
        NoText: "No"
      }
    }).afterClosed().subscribe(async result => {
      if (result) {
        try {
          let deleteFunc: Observable<any>;
          let row_type = "";
          switch (this.type) {
            case 'order_report':
            case 'rm_report':
            case 'under_test_stock_report':
            case 'pm_report': deleteFunc = this.appservice.DeleteReport(row); row_type = "Report"; break;
            case 'composition_master':
            case 'rm_master':
            case 'pm_stock_master':
            case 'brand_master':
            case 'packaging_master': deleteFunc = this.appservice.DeleteLinkingMaster(row); row_type = "Master"; break;
            default:
              throw new Error('Invalid report type');
          }
          let response = await lastValueFrom(deleteFunc);
          if (response) {
            this.reportDataSource.data.splice(index, 1);
            this.reportDataSource.data = this.reportDataSource.data.slice();
            this.sb.open(row_type + " Deleted Successfully", "", {
              duration: 2000
            });
            if (row_type == "Master") {
              let deleted_master_col: string = "";
              switch (this.type) {
                case 'composition_master': deleted_master_col = "composition_generic_name"; break;
                case 'rm_master': deleted_master_col = "rm_item_name"; break;
                case 'pm_stock_master': deleted_master_col = "pm_item_name"; break;
                case 'brand_master': deleted_master_col = "brand_name"; break;
                case 'packaging_master': deleted_master_col = "packaging_code"; break;
              }
              response = await lastValueFrom(this.appservice.GetOrderMaster());
              if (response) {
                if (response[deleted_master_col] && response[deleted_master_col].includes(row[deleted_master_col])) {
                  response[deleted_master_col].splice(response[deleted_master_col].indexOf(row[deleted_master_col]), 1);
                  await lastValueFrom(this.appservice.SetOrderMaster(response))
                }
              }
              
            }
            if (this.type == 'rm_report' || this.type == 'pm_report') { // delete any qty_recieved if deleting a row 

              let cur_qty_recieved = parseFloat(row.qty_recieved);
              if (isNaN(cur_qty_recieved)) cur_qty_recieved = 0;

              if (cur_qty_recieved > 0) {
                let item_name = this.type == 'rm_report' ? row.rm_item_name : row.pm_item_name;
                let res = await lastValueFrom(this.appservice.GetReportById(item_name));
                if (res) {
                  let present_stock = parseFloat(res.present_stock);
                  if (isNaN(present_stock)) present_stock = 0;
                  present_stock -= cur_qty_recieved;
                  res.present_stock = present_stock;
                  res = await lastValueFrom(this.appservice.UpdateReport(res));
                }
              }
            }
          }

          this.saving = false;
        } catch (error) {
          this.sb.open("Could not Delete Report", "", {
            duration: 2000
          });
          this.saving = false;
        }
      }
    });
  }
  getDisplayedColumns() {
    let isHandset = false;
    this.appservice.isHandset$.subscribe((data) => isHandset = data);
    if (this.isStatic || isHandset)
      return this.displayedColumns.map(col => col.colname);
    else
      return this.displayAllCol ?
        this.displayedColumns.map(col => col.colname).concat('action') :
        this.displayedColumns.reduce((acc, col) => {
          if (col.displayCol) acc.push(col.colname);
          return acc;
        }, []).concat('action');
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.reportDataSource.filter = filterValue.trim().toLowerCase();
  }

  formatDate(date: Date) {
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  formatManual(value: any, ctrl: string, row: any) {
    if (ctrl == "cycletime") {
      if (row['po_final_date']) {
        return this.daysBetween(row['po_final_date']);
      }
    }
    return '';
  }

  daysBetween(date: any) {
    const today: any = new Date();
    const targetDate: any = new Date(date);
    const diffInMs: any = today - targetDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    return diffInDays;
  }

  reportTypeChanged(ev: any) {
    this.reportType.setValue(ev.value);
    this.ngOnInit();
  }

  applyDate() {
    this.ngOnInit();
  }
  exportToExcel(): void {
    this.excelService.generateExcel("multi", this.displayedColumns, this.reportDataSource.data, this.exportHeader, this.type);
  }

  userAccessCheck(type: string = this.type) {
    if (this.appservice.user.role == "Admin")
      return true;
    return type in this.appservice.reportAddAccess[this.appservice.user.role];
  }
}
