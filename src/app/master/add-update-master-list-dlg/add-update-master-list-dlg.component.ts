import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { AppService } from '../../app.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-update-master-list-dlg',
  templateUrl: './add-update-master-list-dlg.component.html',
  styleUrl: './add-update-master-list-dlg.component.css'
})
export class AddUpdateMasterListDlgComponent implements OnInit {
  form!: FormGroup;
  saving = false;

  constructor(public appservice: AppService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private sb: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogref: MatDialogRef<AddUpdateMasterListDlgComponent>
  ) {
    this.form = this.fb.group({
      _id: [this.dialogData.row ? this.dialogData.row._id : ''],
      name: [this.dialogData.row ? this.dialogData.row.name : '']
    });
  }

  ngOnInit() { }

  save() {
    this.dialogref.close(this.dialogData.idAndName ? this.form.value : this.form.value.name);
  }
}
