import { Component, OnInit, Inject } from '@angular/core';
import { AppService } from '../../app.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LocaleService } from '../../common/locale/locale.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  form: FormGroup;
  saving = false;

  constructor(private appservice: AppService,
    private router: Router,
    public locale: LocaleService,
    private fb: FormBuilder,
    private sb: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogref: MatDialogRef<RegisterComponent>
  ) {
    if (this.dialogData && this.dialogData.type == 'u') {
      this.form = this.fb.group({
        displayname: [this.dialogData ? this.dialogData.row.displayname : '', [Validators.required]],
        username: [this.dialogData ? this.dialogData.row.username : '', [Validators.required]],
        role: [this.dialogData ? this.dialogData.row.role : '', [Validators.required]]
      });
    }
    else if (this.dialogData && this.dialogData.type == 'p') {
      this.form = this.fb.group({
        password: ['', [Validators.required]],
        cpassword: ['', [Validators.required]]
      });
    }
    else {
      this.form = this.fb.group({
        displayname: ['', [Validators.required]],
        username: ['', [Validators.required]],
        role: ['', [Validators.required]],
        password: ['', [Validators.required]],
        cpassword: ['', [Validators.required]]
      });
    }

  }

  ngOnInit() {

  }
  save() {
    let form_val = this.form.value;
    delete form_val.cpassword;
    if (form_val.role == 'Admin')
      form_val.isAdmin = true;

    this.saving = true;
    if (this.dialogData && this.dialogData.type == 'u') {
      let row = JSON.parse(JSON.stringify(this.dialogData.row));
      row.displayname = form_val.displayname;
      row.username = form_val.username;
      row.role = form_val.role;
      this.appservice.UpdateUser(row)
        .subscribe({
          next: (response) => {
            this.sb.open("User Updated Successfully", "", {
              duration: 2000,
            });
            this.dialogref.close(response);
            this.saving = false;
          },
          error: (error) => {
            this.sb.open("Error Updating User", "", {
              duration: 2000,
            });
            this.saving = false;
          }
        });
    }
    else if (this.dialogData && this.dialogData.type == 'p') {
      let row = JSON.parse(JSON.stringify(this.dialogData.row));
      row.password = form_val.password;
      this.appservice.ChangeUserPassword(row)
        .subscribe({
          next: (response) => {
            this.sb.open("User Updated Successfully", "", {
              duration: 2000,
            });
            this.dialogref.close(response);
            this.saving = false;
          },
          error: (error) => {
            this.sb.open("Error Updating User", "", {
              duration: 2000,
            });
            this.saving = false;
          }
        });
    } else {
      this.appservice.RegisterUser(form_val)
        .subscribe({
          next: (response) => {
            this.sb.open("User Created Successfully", "", {
              duration: 2000,
            });
            this.dialogref.close(response);
            this.saving = false;
          },
          error: (error) => {
            this.sb.open("Error Saving User", "", {
              duration: 2000,
            });
            this.saving = false;
          }
        });
    }
  }
}
