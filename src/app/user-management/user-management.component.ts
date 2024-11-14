import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { RegisterComponent } from './register/register.component';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDlgComponent } from '../common/confirmation-dlg/confirmation-dlg.component';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  saving = false;
  userDataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['displayname', 'username', 'role', 'action'];
  debounceSearch: Function;

  constructor(private appservice: AppService,
    private sb: MatSnackBar,
    private dialog: MatDialog
    ) {
    this.debounceSearch = this.appservice.debounceSearch(this.applyFilter.bind(this), 300);
    this.userDataSource = new MatTableDataSource<any>([]);
    this.userDataSource.filterPredicate = (data, filter: string): boolean => {
      const filterValue = filter.trim().toLowerCase();
      return (data.displayname ?? '').toLowerCase().includes(filterValue)
        || (data.username ?? '').toLowerCase().includes(filterValue)
        || (data.role ?? '').toLowerCase().includes(filterValue)
    };
  }

  ngOnInit() {
    this.saving = true;
    this.appservice.GetAllUsers()
      .subscribe({
        next: (response) => {
          (response.response as any[]).forEach(res => {
            if (res.doc._id != '1') {
              this.userDataSource.data.push(res.doc)
            }
          });
          this.userDataSource.data = this.userDataSource.data.slice()
          this.saving = false;
        },
        error: (error) => {
          this.sb.open("Could not fetch User List", "", {
            duration: 2000
          });
          this.saving = false;
        }
      });
  }

  addUser() {
    this.dialog.open(RegisterComponent, {
      width: '350px', height: '520px'
    }).afterClosed().subscribe(res => {
      if (res) {
        this.userDataSource.data.push(res);
        this.userDataSource.data = this.userDataSource.data.slice();
      }
    });
  }

  updateUser(row: any, index: number) {
    this.dialog.open(RegisterComponent, {
      width: '350px', height: '380px', data: { row, type: 'u' }
    }).afterClosed().subscribe(res => {
      if (res) {
        this.userDataSource.data.splice(index, 1, res);
        this.userDataSource.data = this.userDataSource.data.slice();
      }
    });
  }
  changePassword(row: any, index: number) {
    this.dialog.open(RegisterComponent, {
      width: '350px', height: '300px', data: { row, type: 'p' }
    }).afterClosed().subscribe(res => {
      if (res) {
        this.sb.open("Password Changed Successfully", "", {
          duration: 2000
        });
      }
    });
  }
  deleteUser(row: any, index: number) {
    let user = sessionStorage.getItem('user') ?? null;
    if (user) {
      let id = JSON.parse(user)._id;
      let isAdmin = JSON.parse(user).isAdmin;
      if (row._id == id) {
        this.sb.open("Cannot Delete Self! " + (isAdmin ? "Please ask a different Administrator for Admin User Deletion" : "Please ask your Administrator for User Deletion"), "", {
          duration: 2000,
        });
        return;
      }
    }
      
    this.dialog.open(ConfirmationDlgComponent, {
      width: '250px', closeOnNavigation: true, autoFocus: true,
      data: {
        Question: "Are you Sure..! Do you want to Delete this User?",
        YesText: "Yes",
        NoText: "No"
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.saving = true;
        this.appservice.DeleteUser({ _id: row._id, _rev: row._rev })
          .subscribe({
            next: (response) => {
              this.userDataSource.data.splice(index, 1);
              this.userDataSource.data = this.userDataSource.data.slice();
              this.sb.open("User Deleted Successfully", "", {
                duration: 2000,
              });
              this.saving = false;
            },
            error: (error) => {
              this.sb.open("Could not Delete User", "", {
                duration: 2000,
              });
              this.saving = false;
            }
          });
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.userDataSource.filter = filterValue.trim().toLowerCase();
    this.userDataSource.data = this.userDataSource.data.slice();
  }
}
