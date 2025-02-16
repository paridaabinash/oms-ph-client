import { Component, OnInit, Input } from '@angular/core';
import { AppService } from '../app.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDlgComponent } from '../common/confirmation-dlg/confirmation-dlg.component';
import { ReportAddUpdateDlgComponent } from './report-add-update-dlg/report-add-update-dlg.component';
import { lastValueFrom, Observable } from 'rxjs';
import { DatePipe } from '@angular/common';
import { PageEvent } from '@angular/material/paginator';

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
  displayAllCol: boolean = false; // reports all columns will be visible
  debounceSearch: Function;
  constructor(public appservice: AppService,
    private sb: MatSnackBar,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private route: ActivatedRoute) {
    this.debounceSearch = this.appservice.debounceSearch(this.applyFilter.bind(this), 300);
    this.reportDataSource = new MatTableDataSource<any>([]);
  }

  async ngOnInit() {

    if (this.isStatic) {
      this.reportDataSource.data = this.staticDS;
      return;
    }
    this.saving = true;
    const reportMappings: Record<string, string> = {
      'order_report': 'orderReport',
      'art_report': 'artReport',
      'rm_report': 'rmReport',
      'pm_report': 'pmReport',
      'under_test_stock_report': 'underTestStock'
    };

    const masterMappings: Record<string, string> = {
      'composition_master': 'compositionMaster',
      'packaging_master': 'packagingMaster',
      'rm_master': 'rmMaster',
      'pm_stock_master': 'pmStockMaster',
      'brand_master': 'brandStockMaster',
    };
    let getall: Observable<any>;
    if (reportMappings[this.type]) {
      getall = this.appservice.GetAllReports(reportMappings[this.type]);
      //this.displayAllCol = this.type === 'under_test_stock_report'; // removed previous wrong code of ppic
    } else if (masterMappings[this.type]) {
      getall = this.appservice.GetAllLinkingMaster(masterMappings[this.type]);
      //this.displayAllCol = true;
    } else {
      throw new Error('Invalid report type');
    }

    try {
      const response = await lastValueFrom(getall);
      if (response) {
        this.reportDataSource.data = (response as any[]).map(res => res.doc);
        //  if (this.type == 'under_test_stock_report') { // removed previous wrong code of ppic
        //    const under_test_response = await lastValueFrom(this.appservice.GetAllFilterReports('rmUnderTestFilter'));
        //    if (under_test_response) {
        //      let temp_ds = [];
        //      for (let ut of under_test_response) {
        //        ut = ut.doc;
        //        let match_rm = this.reportDataSource.data.findIndex(rm => rm._id.slice(3) == ut._id)
        //        if (match_rm != -1) {
        //          this.reportDataSource.data[match_rm].qty_recieved = ut.qty_recieved;
        //        } else {
        //          temp_ds.push({
        //            _id: "ut_" + ut._id,
        //            rm_item_name: ut.rm_item_name,
        //            qty_recieved: ut.qty_recieved,
        //            rm_batch: '',
        //            qc_approve_status: '',
        //            type: 'under_test_stock_report'
        //          })
        //        }
        //      }
        //      if (temp_ds.length > 0) {
        //        const bulk_add_response = await lastValueFrom(this.appservice.BulkAddDocuments(temp_ds));
        //        if (bulk_add_response) {
        //          this.reportDataSource.data.concat(bulk_add_response);
        //        }
        //      }
        //    }
        //  }
      }
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
        this.reportDataSource.data.push(res);
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
      width: '90%', height: height, data: { row, ds: this.displayedColumns, type: this.type }, autoFocus: false
    }).afterClosed().subscribe(res => {
      if (res) {
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
    if (this.isStatic)
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
}
