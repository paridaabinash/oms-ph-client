import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { AppService } from '../../app.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, merge, lastValueFrom, filter } from 'rxjs';
import { ConfirmationDlgComponent } from '../../common/confirmation-dlg/confirmation-dlg.component';
import { AddUpdateMasterListDlgComponent } from '../add-update-master-list-dlg/add-update-master-list-dlg.component';

@Component({
  selector: 'app-master-dlg',
  templateUrl: './master-dlg.component.html',
  styleUrl: './master-dlg.component.css'
})
export class MasterDlgComponent implements OnInit {
  saving = false;
  dataChanged = false;
  previousDS: any[] = [];
  displayCol: string[] = [];
  colMaster: any[] = [];

  constructor(public appservice: AppService,
    private router: Router,
    private dialog: MatDialog,
    private sb: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogref: MatDialogRef<MasterDlgComponent>
  ) {}

  async ngOnInit() {
    this.colMaster = this.dialogData.reportDS[this.dialogData.index] ? this.dialogData.reportDS[this.dialogData.index].selection_list : [];
    this.previousDS = this.dialogData.reportDS.slice();
    this.displayCol = ['col', 'action']

    if (!this.dialogData.orderMaster[this.dialogData.col.colname]) {
      this.dialogData.orderMaster[this.dialogData.col.colname] = []
    }
  }

  addMaster() {
    this.dialog.open(AddUpdateMasterListDlgComponent, {
      width: '350px', height: 'auto', data: { col: this.dialogData.col }
    }).afterClosed().subscribe(res => {
      if (res) {
        this.dataChanged = true;
        if (!this.dialogData.orderMaster[this.dialogData.col.colname]) {
          this.dialogData.orderMaster[this.dialogData.col.colname] = []
        }
        this.dialogData.orderMaster[this.dialogData.col.colname].push(res);
        this.dialogData.reportDS[this.dialogData.index].selection_list.push(res);
        this.dialogData.reportDS[this.dialogData.index].selection_list = this.dialogData.reportDS[this.dialogData.index].selection_list.slice()
        this.colMaster = this.dialogData.reportDS[this.dialogData.index].selection_list.slice()
      }
    });
  }

  updateMaster(row: any, index: number) {
    this.dialog.open(AddUpdateMasterListDlgComponent, {
      width: '350px', height: 'auto', data: { row, col: this.dialogData.col }
    }).afterClosed().subscribe(res => {
      if (res) {
        this.dataChanged = true;
        this.dialogData.orderMaster[this.dialogData.col.colname].splice(index, 1, res);
        this.dialogData.reportDS[this.dialogData.index].selection_list.splice(index, 1, res);
        this.dialogData.reportDS[this.dialogData.index].selection_list = this.dialogData.reportDS[this.dialogData.index].selection_list.slice()
        this.colMaster = this.dialogData.reportDS[this.dialogData.index].selection_list.slice()
      }
    });
  }
  deleteMaster(row: any, index: number) {
    this.dialog.open(ConfirmationDlgComponent, {
      width: '250px', closeOnNavigation: true, autoFocus: true,
      data: {
        Question: "Are you Sure..! Do you want to Delete this Entry?",
        YesText: "Yes",
        NoText: "No"
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.dataChanged = true;
        this.dialogData.orderMaster[this.dialogData.col.colname].splice(index, 1);
        this.dialogData.reportDS[this.dialogData.index].selection_list.splice(index, 1);
        this.dialogData.reportDS[this.dialogData.index].selection_list = this.dialogData.reportDS[this.dialogData.index].selection_list.slice()
        this.colMaster = this.dialogData.reportDS[this.dialogData.index].selection_list.slice()
      }
    })
  }

  async save() {
    this.saving = true;
    try {
      let res = await lastValueFrom(this.appservice.SetOrderMaster(this.dialogData.orderMaster))
      if (res)
        this.sb.open("Order Master Updated", "", {
          duration: 2000
        });
      this.dialogref.close();
      this.dataChanged = false;
      this.saving = false;
    }
    catch (error) {
      this.sb.open("Could not fetch Order Master", "", {
        duration: 2000
      });
      this.dialogData.reportDS = this.previousDS.slice()
      this.saving = false;
    }
  }
}
