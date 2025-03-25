import { Component, OnInit, Input } from '@angular/core';
import { AppService } from '../app.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { MasterDlgComponent } from './master-dlg/master-dlg.component';


@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrl: './master.component.css'
})
export class MasterComponent implements OnInit {
  saving = false;
  @Input() type: string = '';
  @Input() displayedColumns: any[] = [];
  orderMaster: any[] = [];
  reportDS: any[] = [];

  constructor(public appservice: AppService,
    private sb: MatSnackBar,
    private dialog: MatDialog) { }

  async ngOnInit() {
    this.saving = true;
    try {
      const response = await lastValueFrom(this.appservice.GetOrderMaster());
      if (response) {
        this.orderMaster = response;
        for (let res in response) { // add all selection lists to ds
          let selection_col_ind = this.appservice.orderDS.findIndex(col => col.colname == res);
          if (selection_col_ind != -1) {
            this.appservice.orderDS[selection_col_ind].selection_list = response[res];
          }
        }
        this.reportDS = this.appservice.orderDS;
      }
      this.saving = false;
    } catch (error) {
      this.sb.open("Could not fetch Order Master", "", {
        duration: 2000
      });
      this.saving = false;
    }
  }

  onTabChange(event: any) {
    //if (event.index == 0) {
    //  for (let res in this.orderMaster) { // add all selection lists to ds
    //    let selection_col_ind = this.appservice.orderDS.findIndex(col => col.colname == res);
    //    if (selection_col_ind != -1) {
    //      this.appservice.orderDS[selection_col_ind].selection_list = this.orderMaster[res];
    //    }
    //  }
    //  this.reportDS = this.appservice.orderDS;
    //}
    //else if (event.index == 1) {
    //  for (let res in this.orderMaster) { // add all selection lists to ds
    //    let selection_col_ind = this.appservice.rmDS.findIndex(col => col.colname == res);
    //    if (selection_col_ind != -1) {
    //      this.appservice.rmDS[selection_col_ind].selection_list = this.orderMaster[res];
    //    }
    //  }
    //  this.reportDS = this.appservice.rmDS;
    //}
    //else if (event.index == 2) {
    //  for (let res in this.orderMaster) { // add all selection lists to ds
    //    let selection_col_ind = this.appservice.pmDS.findIndex(col => col.colname == res);
    //    if (selection_col_ind != -1) {
    //      this.appservice.pmDS[selection_col_ind].selection_list = this.orderMaster[res];
    //    }
    //  }
    //  this.reportDS = this.appservice.pmDS;
    //}
    //else if (event.index == 3) {
    //  for (let res in this.orderMaster) { // add all selection lists to ds
    //    let selection_col_ind = this.appservice.artDS.findIndex(col => col.colname == res);
    //    if (selection_col_ind != -1) {
    //      this.appservice.artDS[selection_col_ind].selection_list = this.orderMaster[res];
    //    }
    //  }
    //  this.reportDS = this.appservice.artDS;
    //}
    let ds_array = ["orderDS", "rmDS", "pmDS", "artDS", "compositionMaster", "packageMaster", "rmMaster", "pmStockMaster"]
    for (let i = 0; i < 7; i++) {
      if (event.index == i) {
        for (let res in this.orderMaster) { // add all selection lists to ds
          let selection_col_ind = ((this.appservice as any)[ds_array[i]] as any[]).findIndex(col => col.colname == res);
          if (selection_col_ind != -1) {
            ((this.appservice as any)[ds_array[i]] as any[])[selection_col_ind].selection_list = this.orderMaster[res];
          }
        }
        this.reportDS = ((this.appservice as any)[ds_array[i]] as any[]);
      }
    }
  }
  ds_array: string[] = ["Order Report", "RM Report", "PM Report", "Artwork Report", "Composition List", "Packaging List", "RM List", "PM List"]
  addMaster(col: any) {

    let index = this.reportDS.findIndex(cl => cl.colname == col.colname);

    this.dialog.open(MasterDlgComponent, {
      width: '80%', height: 'auto', maxHeight: '80vh', data: { col, index, reportDS: this.reportDS, orderMaster: JSON.parse(JSON.stringify(this.orderMaster)), ds: this.displayedColumns, type: this.type }
    }).afterClosed().subscribe(res => {
      if (res) {
      }
    });
  }
}
