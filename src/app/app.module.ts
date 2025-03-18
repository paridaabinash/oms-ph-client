import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './user-management/login/login.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReportComponent } from './report/report.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { RegisterComponent } from './user-management/register/register.component';
import { ConfirmationDlgComponent } from './common/confirmation-dlg/confirmation-dlg.component';
import { ReportAddUpdateDlgComponent } from './report/report-add-update-dlg/report-add-update-dlg.component';
import { MasterComponent } from './master/master.component';
import { MasterDlgComponent } from './master/master-dlg/master-dlg.component';
import { AddUpdateMasterListDlgComponent } from './master/add-update-master-list-dlg/add-update-master-list-dlg.component';
import { LinkingMasterComponent } from './linking-master/linking-master.component';
import { PpicReportComponent } from './ppic-report/ppic-report.component';
import { BomComponent } from './ppic-report/bom/bom.component';
import { BomDlgComponent } from './ppic-report/bom/bom-dlg/bom-dlg.component';
import { ExcelService } from './excel.service';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    DashboardComponent,
    ReportComponent,
    UserManagementComponent,
    RegisterComponent,
    ConfirmationDlgComponent,
    ReportAddUpdateDlgComponent,
    MasterComponent,
    MasterDlgComponent,
    AddUpdateMasterListDlgComponent,
    LinkingMasterComponent,
    PpicReportComponent,
    BomComponent,
    BomDlgComponent
  
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'oms-we' }),
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatSelectModule,
    MatToolbarModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatTableModule,
    DragDropModule,
    MatDialogModule,
    MatCardModule,
    MatMenuModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonToggleModule,
    MatExpansionModule,
    CdkAccordionModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule

  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, // Sets locale
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }, // Custom formats
    { provide: LOCALE_ID, useValue: localStorage.getItem("LOCALE_ID") || "en-US" },
    ExcelService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
