import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDlgComponent } from '../common/confirmation-dlg/confirmation-dlg.component';
import { AppService } from '../app.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  saving = false;
  @ViewChild(MatSidenav) sidenav!: MatSidenav;
  isMobile = false;
  isCollapsed = true;
  isSidenavLoaded: boolean = false;
  selectedMenu = 'order_report';
  view_access = {};

  constructor(private observer: BreakpointObserver,
    private dialog: MatDialog,
    public appservice: AppService,
    public route: Router,
    private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    let user = sessionStorage.getItem('user') ?? null;
    if (user)
      this.appservice.user = JSON.parse(user);
    else {
      this.route.navigate(['']);
    }
  }

  ngAfterViewInit() {

    this.observer.observe([Breakpoints.Handset]).subscribe((screenSize) => {
      this.isMobile = screenSize.matches;
      this.isSidenavLoaded = true;
      this.cdr.detectChanges();
    });



  }

  toggleMenu() {
    if (this.isMobile) {
      this.sidenav.toggle();
      this.isCollapsed = false; // On mobile, the menu can never be collapsed
    } 
  }
  menuClick() {
    if (this.isMobile && this.sidenav.opened)
      this.sidenav.close()
  }

  logout() {
    this.dialog.open(ConfirmationDlgComponent, {
      width: '250px', closeOnNavigation: true, autoFocus: true,
      data: {
        Question: "Are you Sure..! Do you want to Logout?",
        YesText: "Yes",
        NoText: "No"
      }
    }).afterClosed().subscribe(result => {
      if (result)
        this.appservice.logout();
    });
  }
}

