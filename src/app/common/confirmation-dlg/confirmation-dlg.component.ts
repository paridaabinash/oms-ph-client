import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppService } from '../../app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirmation-dlg',
  templateUrl: './confirmation-dlg.component.html',
  styleUrls: ['./confirmation-dlg.component.scss']
})
export class ConfirmationDlgComponent {

  constructor(private dialogRef: MatDialogRef<ConfirmationDlgComponent>,
    public router: Router,
    public appservice: AppService,
    @Inject(MAT_DIALOG_DATA) public dialogData: any) {
    }

}
