import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { AppService } from '../../../app.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-bom-dlg',
  templateUrl: './bom-dlg.component.html',
  styleUrl: './bom-dlg.component.css'
})
export class BomDlgComponent {
  form!: FormGroup;
  saving = false;
  brandList: string[] = [];
  constructor(public appservice: AppService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private sb: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogref: MatDialogRef<BomDlgComponent>
  ) {
    this.form = this.fb.group({
      rm_stock_name: [this.dialogData.row ? this.dialogData.row.rm_stock_name : ''],
      unit: [{ value: this.dialogData.row ? this.dialogData.row.unit : '', disabled: true }],
      present_stock: [{ value: this.dialogData.row ? this.dialogData.row.present_stock : '', disabled: true }],
      standard_qty: [this.dialogData.row ? this.dialogData.row.standard_qty : ''],
      changepart_number: [this.dialogData.row ? this.dialogData.row.changepart_number : ''],
      remarks: [this.dialogData.row ? this.dialogData.row.remarks : ''],
      po_number: [this.dialogData.row ? this.dialogData.row.po_number : ''],
      po_date: [this.dialogData.row ? this.dialogData.row.po_date : ''],
      party_name: [this.dialogData.row ? this.dialogData.row.party_name : ''],
    });
  }

  async ngOnInit() {
    this.saving = true;

    try {
      const response = await lastValueFrom(this.appservice.GetOrderMaster());
      if (response) {
        this.brandList = response['rm_stock_name'];
      }
      this.saving = false;
    } catch (error) {
      this.sb.open("Could not fetch All Order Master", "", {
        duration: 2000
      });
      this.saving = false;
    }
  }

  async onMasterSelectionChange(event: any) {
    this.saving = true;
    let selectedValue = event.option.value.replace(/[^a-zA-Z0-9]/g, '_')
    try {
      let res = await lastValueFrom(this.appservice.GetLinkingMasterById(selectedValue))
      if (res) {
        this.form.patchValue({ rm_stock_name: res['rm_stock_name'], unit: res['unit'], present_stock: res['present_stock'] })
      }
      this.saving = false;
    } catch (error) {
      this.sb.open("Could not fetch BOM Master", "", {
        duration: 2000
      });
      this.saving = false;
    }

  }

  save() {
    this.dialogref.close(this.form.getRawValue());
  }
}
