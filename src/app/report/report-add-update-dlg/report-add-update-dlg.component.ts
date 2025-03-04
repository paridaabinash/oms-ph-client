import { Component, OnInit, Inject, ElementRef, ViewChild, ChangeDetectorRef, NgZone, OnDestroy } from '@angular/core';
import { AppService } from '../../app.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, lastValueFrom, Subscription, merge } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { ConfirmationDlgComponent } from '../../common/confirmation-dlg/confirmation-dlg.component';
import { LocaleService } from '../../common/locale/locale.service';
import { ExcelService } from '../../excel.service';

@Component({
  selector: 'app-report-add-update-dlg',
  templateUrl: './report-add-update-dlg.component.html',
  styleUrl: './report-add-update-dlg.component.css',
  providers: [DatePipe]
})
export class ReportAddUpdateDlgComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  saving = false;
  dlgHeading: string = '';
  filteredOptions: { [key: string]: Observable<any[]> } = {};
  orderMaster: any = {};
  productMasterDS: any[] = [];
  columnDS: any[] = [];
  controlArrayValue: any = {};
  @ViewChild('form_elem') form_elem!: ElementRef;
  private subscription: Subscription = new Subscription();

  clicked_heading: string[] = [];
  exportHeader: string = "";
  worker!: Worker;

  constructor(public appservice: AppService,
    private sb: MatSnackBar,
    public locale: LocaleService,
    private dialog: MatDialog,
    private excelService: ExcelService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogref: MatDialogRef<ReportAddUpdateDlgComponent>
  ) {
    this.form = new FormGroup({});
    this.columnDS = JSON.parse(JSON.stringify(this.dialogData.ds));

    this.columnDS.forEach(item => {
      if (!item.heading)
        this.form.addControl(item.colname, new FormControl(''));
    });
  }

  async ngOnInit() {


    const exportHeaders: Record<string, string> = {
      'order_report': 'Order Report',
      'art_report': 'Art Report',
      'rm_report': 'RM Report',
      'pm_report': 'PM Report'
    };
    this.exportHeader = this.dialogData.row ? exportHeaders[this.dialogData.type] : "";
    if (this.appservice.user.role != 'Admin') {
      Object.keys(this.locale.Locale.user.roles).forEach(role => {
        if (this.appservice.user.role != role) this.clicked_heading.push(role)
      });
    }

    switch (this.dialogData.type) {
      case 'order_report': this.dlgHeading = !this.dialogData.row ? 'Add New Order Report' : 'Update Order Report'; break;
      case 'art_report': this.dlgHeading = !this.dialogData.row ? 'Add New Artwork Report' : 'Update Artwork Report'; break;
      case 'rm_report': this.dlgHeading = !this.dialogData.row ? 'Add New RM Report' : 'Update RM Report'; break;
      case 'pm_report': this.dlgHeading = !this.dialogData.row ? 'Add New PM Report' : 'Update PM Report'; break;
      case 'under_test_stock_report': this.dlgHeading = !this.dialogData.row ? 'Add New Under Test Report' : 'Update Under Test Report'; break;
      case 'composition_master': this.dlgHeading = !this.dialogData.row ? 'Add New Composition Master' : 'Update Composition Master'; break;
      case 'packaging_master': this.dlgHeading = !this.dialogData.row ? 'Add New Packing Master' : 'Update Packing Master'; break;
      case 'rm_master': this.dlgHeading = !this.dialogData.row ? 'Add New RM Master' : 'Update RM Master'; break;
      case 'pm_stock_master': this.dlgHeading = !this.dialogData.row ? 'Add New PM Stock Master' : 'Update PM Stock Master'; break;
      case 'brand_master': this.dlgHeading = !this.dialogData.row ? 'Add New Brand Master' : 'Update Brand Master'; break;
      case 'brand_master_rm': this.dlgHeading = !this.dialogData.row ? 'Add New RM Linking' : 'Update RM Linking'; break;
      case 'brand_master_pm': this.dlgHeading = !this.dialogData.row ? 'Add New PM Linking' : 'Update PM Linking'; break;
      default:
        throw new Error('Invalid report type');
    }

    this.saving = true;
    try {
      const response = await lastValueFrom(this.appservice.GetOrderMaster());

      if (response) {
        this.orderMaster = response;
        for (let res in response) { // add all selection lists to ds
          let selection_col_ind = this.columnDS.findIndex(col => col.colname == res);
          if (selection_col_ind != -1) {
            this.columnDS[selection_col_ind].selection_list = response[res];
          }
        }
      }
      if (this.dialogData.type == 'art_report') {
        try {
          let res = await lastValueFrom(this.appservice.GetImagesById('img-' + this.dialogData.row._id))
          if (res) {
            this.imagelist = res;
            let imageColumnList = this.columnDS.filter(col => col.image);
            for (let img of this.imagelist) {
              for (let col of imageColumnList) {
                if (img.name.includes(col.colname)) {
                  this.dialogData.row[col.colname] = img.name;
                  this.dialogData.row[col.colname + "url"] = img.url;
                }
              }
            }
          }
        }
        catch (error) {
          console.error("Could not fetch Images", error);
        }
      }
      if (this.dialogData.type == 'brand_master') {
        if (this.dialogData.row) {
          this.columnDS[1].ds = this.dialogData.row['rm_item_name_list']; //appservice.brandStockMaster
          this.columnDS[2].ds = this.dialogData.row['pm_item_name_list'];
        } else {
          this.columnDS[1].ds = [];
          this.columnDS[2].ds = [];

        }

      }
      if (this.dialogData.type == 'rm_report' || this.dialogData.type == 'pm_report') {
        const ord_res: any[] = await lastValueFrom(this.appservice.GetAllFilterReports("pendingOrders", false, null));
        if (ord_res) {
          this.columnDS[0].selection_list = ord_res.map(res => res.id); // "wo_number"
        }
      }

      this.setupAutocompleteFilters();
      this.manualInputChange();

      // inputs interlinking calculation ----------------------
      if (this.dialogData.type == 'order_report')
        this.handleQtyInTabs(null, this.form.controls)

      if (this.dialogData.type == 'rm_report')
        this.handleRMPMPendingCalculation(null, this.form.controls)

      if (this.dialogData.type == 'pm_report')
        this.handlePMCalculation(null, this.form.controls)
      // -------------------------------------------------------
      this.saving = false;
    } catch (error) {
      this.sb.open("Could not fetch Order Master", "", {
        duration: 2000
      });
      this.saving = false;
    }
  }

  setupAutocompleteFilters() {
    let form = this.form;
    this.columnDS.forEach(item => {
      if (!item.heading) { //skipping heading rows in order_report
        const controlval = this.dialogData.row ? this.dialogData.row[item.colname] : (item.isarray ? [] : ("default" in item ? item.default : ''));

        (form.get(item.colname) as FormControl).setValue(controlval);

        const fcontrol = form.get(item.colname) as FormControl;
        if (item.required)
          fcontrol.addValidators(Validators.required);
        if (this.appservice.user.role != 'Admin' && item.right && item.right != this.appservice.user.role)
          fcontrol.disable();
        if (item.autofill && this.dialogData.type.includes('_report'))
          fcontrol.disable();
        if (item.disable_after && this.dialogData.row) // disable some intput after creation
          fcontrol.disable();

        if (item.autocomplete) {
          this.filteredOptions[item.colname] =
            fcontrol.valueChanges.pipe(
              debounceTime(300),
              startWith(''),
            ).pipe(
              map(value => this._filter(value || '', item.selection_list))
            );
        }
      }
    });
    //if (this.dialogData.type == 'order_report') { // extra data that should not show in report or form, just save for different prps
    //  if (this.dialogData.row && this.dialogData.row['rm_item_name'])
    //    form.addControl('rm_item_name', new FormControl(this.dialogData.row['rm_item_name']));
    //}
  }

  private _filter(value: any, options: any[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => option.toLowerCase().includes(filterValue));
  }

  //onSelectionChange(ev: any, controlName: string, sel_list: any[]) {
  //  let sel_el = sel_list.find(col => col.name == ev.value);
  //  if (!sel_el)
  //    return;
  //  if (this.controlArrayValue[controlName])
  //    this.controlArrayValue[controlName] = [];
  //  this.controlArrayValue[controlName].push(sel_el._id);
  //}

  onBlur(selection_list: string[], form_ctrl: string, ind: any) {
    setTimeout(() => {
      if (selection_list && !selection_list.includes(this.form.get(form_ctrl)?.value)) {
        //console.log(this.dialogData.ds[ind], form_ctrl, this.form.get(form_ctrl)?.value, !selection_list.includes(this.form.get(form_ctrl)?.value))
        this.form.patchValue({ form_ctrl: "" })
        //console.log(this.form.value, this.form.get(form_ctrl)?.value)
      }
    });
  }

  async onMasterSelectionChange(event: any, controlName: string, isMaster: boolean, order_master: boolean) {

    if (!isMaster || this.dialogData.type == 'composition_master' || this.dialogData.type == 'packaging_master' || this.dialogData.type == 'rm_master' || this.dialogData.type == 'pm_stock_master' || this.dialogData.type == 'brand_master_rm' || this.dialogData.type == 'brand_master_pm' || this.dialogData.type == 'brand_master') {
      return;
    }
    let selectedValue = event.option.value;
    let form = this.form;
    this.saving = true;

    let getMaster = order_master ? this.appservice.GetReportById(selectedValue) : this.appservice.GetLinkingMasterById(selectedValue)
    try {
      let res = await lastValueFrom(getMaster);
      if ((this.dialogData.type == "rm_report" || this.dialogData.type == "pm_report") && controlName == "wo_number") {
        let brand_det: any = await lastValueFrom(this.appservice.GetReportById(res.brand_name));
        if (this.dialogData.type == "rm_report") {
          this.columnDS[2].selection_list = (brand_det.rm_item_name_list as any[]).map(rm => rm.rm_item_name); // "rm_item_name"
        }
        else {
          this.columnDS[2].selection_list = (brand_det.pm_item_name_list as any[]).map(pm => pm.pm_item_name);; // "pm_item_name"
        }

        this.zone.run(() => {
          this.columnDS = JSON.parse(JSON.stringify(this.columnDS));
          this.cdr.detectChanges();
        });
      }
      if (res) {
        for (let field in res) {
          let contrl = (form.get(field) as FormControl);
          if (field == "packaging_code" && controlName == "composition_code") {
            this.filteredOptions[field] =
              contrl.valueChanges.pipe(
                debounceTime(300),
                startWith(''),
              ).pipe(
                map(value => this._filter(value || '', res[field]))
              );
            continue;
          }
          if (contrl)
            contrl.setValue(res[field]);
        }
        //if (controlName == "composition_code") {
        //  try { //only fetch 3/4 packaging list that are linked with composition master
        //    const response = await lastValueFrom(this.appservice.GetLinkingMasterByIds("packaging_master", packaging_list));
        //    if (response) {
        //      let contrl = (form.get("packaging_code") as FormControl);
        //      this.filteredOptions["packaging_code"] =
        //        contrl.valueChanges.pipe(
        //          debounceTime(300),
        //          startWith(''),
        //        ).pipe(
        //          map(value => this._filter(value || '', response, true))
        //        );
        //    }
        //  } catch (error) {
        //    this.sb.open("Could not fetch Packing Master", "", {
        //      duration: 2000
        //    });
        //  }
        //}

      }
      this.saving = false;
    } catch (error) {
      this.sb.open("Could not fetch Product Master", "", {
        duration: 2000
      });
      this.saving = false;
    }

  }

  async save() {
    this.saving = true;
    let form_val = this.form.getRawValue();
    if (this.dialogData.row) {
      form_val._id = this.dialogData.row._id;
      form_val._rev = this.dialogData.row._rev;
      form_val.created_at = this.dialogData.row.created_at;
    } else {
      form_val.created_at = Date.now();
    }
    let master_changed = false;

    form_val.type = this.dialogData.type;
    let saveFunc: Observable<any>, type = '';
    switch (this.dialogData.type) {

      case 'order_report': saveFunc = this.dialogData.row ? this.appservice.UpdateReport(form_val) : this.appservice.CreateReport(form_val); type = "Order"; break;
      case 'art_report': saveFunc = this.appservice.UpdateReport(form_val); type = "Artwork"; break;
      case 'rm_report': saveFunc = this.dialogData.row ? this.appservice.UpdateReport(form_val) : this.appservice.CreateReport(form_val); type = "RM"; break;
      case 'pm_report': saveFunc = this.dialogData.row ? this.appservice.UpdateReport(form_val) : this.appservice.CreateReport(form_val); type = "PM"; break;
      case 'under_test_stock_report': saveFunc = this.dialogData.row ? this.appservice.UpdateReport(form_val) : this.appservice.CreateReport(form_val); type = "Under Test"; break;
      case 'composition_master':
      case 'rm_master':
      case 'pm_stock_master':
      case 'brand_master':
      case 'packaging_master': saveFunc = this.dialogData.row ? this.appservice.UpdateLinkingMaster(form_val) : this.appservice.CreateLinkingMaster(form_val); type = "Master Linking"; break;
      case 'brand_master_rm':
      case 'brand_master_pm': this.dialogref.close(form_val); return;
      default:
        throw new Error('Invalid report type');
    }
    try {
      let response = await lastValueFrom(saveFunc)
      if (type == 'Master Linking') {
        for (let col in this.filteredOptions) { // save new lists
          if (!(col in this.orderMaster) || !this.orderMaster[col].includes(form_val[col])) {
            //? (this.orderMaster[col] as any[]).some(obj => obj._id == response._id) : this.orderMaster[col].includes(form_val[col]))
            if (!this.orderMaster[col])
              this.orderMaster[col] = [];
            if (form_val[col])
              this.orderMaster[col].push(form_val[col]);
            master_changed = true;
          }
        }
        if (master_changed) { // add name to order_report_selection_list for use as key
          try {
            let res = await lastValueFrom(this.appservice.SetOrderMaster(this.orderMaster))
            if (res)
              this.sb.open("Order Master Updated", "", {
                duration: 1500
              });
          }
          catch (error) {
            this.sb.open("Could not fetch Order Master", "", {
              duration: 1500
            });
          }
        }
        if (this.dialogData.type == 'brand_master') {
          this.columnDS[1].ds = []; //brandStockMaster
          this.columnDS[2].ds = [];
        }
      }
      else if (type == 'Order') {
        if (form_val.order_type.toLowerCase() == 'new') {
          let artwork: any = {};
          for (let obj of this.appservice.artDS) {
            if (form_val[obj.colname])
              artwork[obj.colname] = form_val[obj.colname];
            else {
              artwork[obj.colname] = '';
            }
          }
          artwork.type = 'art_report';
          artwork.artwork_status = 'Incomplete';

          try {
            await lastValueFrom(this.dialogData.row ? this.appservice.UpdateReport(artwork) : this.appservice.CreateReport(artwork))

          }
          catch (error) {
            this.sb.open("Could not create Artwork Report", "", {
              duration: 1500
            });
          }
        }
        if (form_val.order_status == "Completed") {
          let res = await lastValueFrom(this.appservice.GetReportById(form_val.brand_name));
          let total_order_qty = form_val.qty_in_tabs, rm_list: any = {}, pm_list: any = {};
          if (res.rm_item_name_list) {
            (res.rm_item_name_list as any[]).forEach(rm => rm_list[rm.rm_item_name] = { completed_qty: (total_order_qty * rm.calc_offset) / 100000 });
          }
          if (res.pm_item_name_list) {
            (res.pm_item_name_list as any[]).forEach(pm => pm_list[pm.pm_item_name] = { completed_qty: (total_order_qty * pm.calc_offset) / 100000 });
          }
          res = await lastValueFrom(this.appservice.GetLinkingMasterByIds("rmAndpmList", [...(Object.keys(rm_list)), ...(Object.keys(pm_list))], true));
          let all_rm_pm: any = [];
          if (res) {
            all_rm_pm = (res as any[]).map(item => {
              if (item.doc.type == "pm_stock_master")
                item.doc.present_stock = item.doc.present_stock - pm_list[item.doc.pm_item_name].completed_qty;
              else
                item.doc.present_stock = item.doc.present_stock - rm_list[item.doc.rm_item_name].completed_qty;
              return item.doc;
            });
          }
          if (all_rm_pm.length > 0) {
            res = await lastValueFrom(this.appservice.BulkAddDocuments(all_rm_pm));
          }
        }
      }
      else if (type == 'Artwork') {
        const payload = {
          _id: "img-" + response._id,
          images: this.images,
        };
        try {
          let res = await lastValueFrom(this.appservice.UploadImages(payload))
          if (res)
            for (let img of res.images) {
              response[img.colname] = img.name;
            }
        }
        catch (error) {
          this.sb.open("Could not update Artwork Master", "", {
            duration: 1500
          });
        }
      }
      else if (type == 'RM' || type == 'PM') { // present stock update

        if (form_val._id) { // updating qty_recvd 
          let prev_qty_recieved = parseFloat(this.dialogData.row.qty_recieved);
          let cur_qty_recieved = parseFloat(form_val.qty_recieved);
          if (isNaN(prev_qty_recieved)) prev_qty_recieved = 0;
          if (isNaN(cur_qty_recieved)) cur_qty_recieved = 0;

          let item_name = type == 'RM' ? form_val.rm_item_name : form_val.pm_item_name;
          let res = await lastValueFrom(this.appservice.GetReportById(item_name));
          if (res) {
            let present_stock = parseFloat(res.present_stock);
            if (isNaN(present_stock)) present_stock = 0;
            present_stock += (cur_qty_recieved - prev_qty_recieved);
            res.present_stock = present_stock;
            res = await lastValueFrom(this.appservice.UpdateReport(res));
          }

        } else {  // recv_qty during addition
          let cur_qty_recieved = parseFloat(form_val.qty_recieved);
          if (isNaN(cur_qty_recieved)) cur_qty_recieved = 0;

          let item_name = type == 'RM' ? form_val.rm_item_name : form_val.pm_item_name;
          let res = await lastValueFrom(this.appservice.GetReportById(item_name));
          if (res) {
            let present_stock = parseFloat(res.present_stock);
            if (isNaN(present_stock)) present_stock = 0;
            present_stock += cur_qty_recieved;
            res.present_stock = present_stock;
            res = await lastValueFrom(this.appservice.UpdateReport(res));
          }
        }


      }
     
      this.sb.open(type + (this.dialogData.row ? " Updated" : " Created") + " Successfully", "Ok", {
        duration: 2000
      });
      this.saving = false;
      this.dialogref.close(response);
    }
    catch (error) {
      this.sb.open("Could not update " + type, "", {
        duration: 2000
      });
      this.saving = false;
    }


  }

  images: { [key: string]: { file: File; base64: string } } = {};
  imagelist: any[] = [];

  onFileSelected(event: Event, field: string) {
    let file = (event.target as HTMLInputElement).files?.[0];
    if (file && file.type.match(/image\/jpeg|image\/jpg/)) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        const renamedFile = new File([file], field, { type: file.type });
        this.images[field] = { file: renamedFile, base64: base64String };
        this.form.patchValue({
          [field]: renamedFile.name, // Store base64 string in the form control
        });
        this.dialogData.row[field + "url"] = URL.createObjectURL(renamedFile);;
      };
      reader.readAsDataURL(file);
    } else {
      this.sb.open('Only JPEG/JPG files are allowed', "", {
        duration: 2000
      });
    }
  }

  manualInputChange() {
    let form_ctrl = this.form.controls;
    if (this.dialogData.type == 'order_report') {
      this.subscription = merge(
        form_ctrl['order_qty'].valueChanges,
        form_ctrl['pack_type'].valueChanges,
        form_ctrl['rfd'].valueChanges,
        form_ctrl['dispatch'].valueChanges).subscribe(value => this.handleQtyInTabs(value, form_ctrl));

      this.subscription = merge(
        form_ctrl['po_final_date'].valueChanges).subscribe(value => this.handleOrderDate(value, form_ctrl));
    }
    if (this.dialogData.type == 'rm_report') {
      this.subscription = merge(
        form_ctrl['po_quantity'].valueChanges,
        form_ctrl['qty_recieved'].valueChanges).subscribe(value => this.handleRMPMPendingCalculation(value, form_ctrl));
    }
    if (this.dialogData.type == 'pm_report') {
      this.subscription = merge(
        form_ctrl['po_date'].valueChanges).subscribe(value => this.handlePMCalculation(value, form_ctrl));
      this.subscription = merge(
        form_ctrl['po_quantity'].valueChanges,
        form_ctrl['qty_recieved'].valueChanges).subscribe(value => this.handleRMPMPendingCalculation(value, form_ctrl));
    }
  }
  handleQtyInTabs(value: any, form_ctrl: any) {
    let qty_in_tabs_val,
      pack_type = form_ctrl['pack_type'].value,
      order_qty = form_ctrl['order_qty'].value;

    if (pack_type && order_qty) {
      if (pack_type.includes('*')) {
        qty_in_tabs_val = (pack_type.split('*') as any[]).reduce((acc, cum) => parseFloat(acc) * parseFloat(cum)) * parseFloat(order_qty);
      } else {
        qty_in_tabs_val = parseFloat(order_qty);
      }
      form_ctrl['qty_in_tabs'].patchValue(qty_in_tabs_val);
    } else {
      form_ctrl['qty_in_tabs'].patchValue(null);
    }

    let qty_in_tabs = form_ctrl['qty_in_tabs'].value,
      rfd = form_ctrl['rfd'].value,
      dispatch = form_ctrl['dispatch'].value;

    if (qty_in_tabs) {
      form_ctrl['balance_qty'].patchValue(parseFloat(qty_in_tabs) - parseFloat(rfd ? rfd : 0) - parseFloat(dispatch ? dispatch : 0));
    } else {
      form_ctrl['balance_qty'].patchValue(0);
    }
    if (dispatch) {
      form_ctrl['yield'].patchValue((parseFloat(dispatch) / parseFloat(qty_in_tabs)) * 100);
      form_ctrl['order_status'].patchValue((parseFloat(dispatch) / parseFloat(qty_in_tabs)) * 100 > 95 ? 'Completed' : 'Pending')
    } else {
      form_ctrl['yield'].patchValue(0);
      form_ctrl['order_status'].patchValue('Pending');
    }
  }
  handleRMPMPendingCalculation(value: any, form_ctrl: any) {
    let po_quantity = form_ctrl['po_quantity'].value,
      qty_recieved = form_ctrl['qty_recieved'].value;
    if (po_quantity)
      form_ctrl['pending'].patchValue(parseFloat(po_quantity) - parseFloat(qty_recieved ? qty_recieved : 0));
    else
      form_ctrl['pending'].patchValue(0);
  }
  handlePMCalculation(value: any, form_ctrl: any) {
    let po_date = form_ctrl['po_date'].value;
    if (po_date)
      form_ctrl['seniority'].patchValue(this.daysBetween(po_date));
    else form_ctrl['seniority'].patchValue('');

  }
  handleOrderDate(value: any, form_ctrl: any) {
    let po_final_date = form_ctrl['po_final_date'].value;
    if (po_final_date)
      form_ctrl['cycletime'].patchValue(this.daysBetween(po_final_date));
    else form_ctrl['cycletime'].patchValue('');
  }
  daysBetween(date: any) {
    const today: any = new Date();
    const targetDate: any = new Date(date);
    const diffInMs: any = today - targetDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    return diffInDays;
  }



  getDisplayedCol(expansion_table: string) {
    return (this.appservice as any)[expansion_table];
  }
  getDisplayedColumns(expansion_table: string) {
    return ((this.appservice as any)[expansion_table] as any[]).map(col => col.colname).concat("action");
  }
  addRow(item: any, displayedColumns: any, type: string) {
    this.dialog.open(ReportAddUpdateDlgComponent, {
      width: '90%', height: 'auto', data: { ds: this.getDisplayedCol(displayedColumns), type: type }, autoFocus: false
    }).afterClosed().subscribe(res => {
      if (res) {
        item.ds.push(res);
        item.ds = item.ds.slice();
        this.form.get(item.colname)?.setValue(item.ds);
      }
    });
  }
  updateRow(row: any, index: number, item: any, displayedColumns: any, type: string) {

    this.dialog.open(ReportAddUpdateDlgComponent, {
      width: '90%', height: 'auto', data: { row, ds: this.getDisplayedCol(displayedColumns), type: type }, autoFocus: false
    }).afterClosed().subscribe(res => {
      if (res) {
        item.ds.splice(index, 1, res);
        item.ds = item.ds.slice();
        this.form.get(item.colname)?.setValue(item.ds);
      }
    });
  }
  deleteRow(row: any, index: number, item: any) {
    this.dialog.open(ConfirmationDlgComponent, {
      width: '250px', closeOnNavigation: true, autoFocus: true,
      data: {
        Question: "Are you Sure..! Do you want to Delete this Entry?",
        YesText: "Yes",
        NoText: "No"
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        item.ds.splice(index, 1);
        item.ds = item.ds.slice();
        this.form.get(item.colname)?.setValue(item.ds);
      }
    });
  }

  userAccessCheck(type: string = this.dialogData.type) {
    let user: any = this.appservice.user;
    let view_access: any = {
      order_report: user.role == "Admin" || user.role == "Sales" || user.role == "Production" || user.role == "Dispatch" || user.role == "PPIC",
      art_report: user.role == "Admin" || user.role == "Artwork",
      rm_report: user.role == "Admin" || user.role == "PPIC",
      pm_report: user.role == "Admin" || user.role == "PPIC",
      ppic_report: user.role == "Admin" || user.role == "PPIC"
    }
    if (type.includes("master"))
      return user.role == "Admin"
    if (type in view_access)
      return view_access[type];
    return false;
  }

  headingClicked(heading: string) {
    if (this.clicked_heading.includes(heading))
      this.clicked_heading.splice(this.clicked_heading.indexOf(heading), 1);
    else
      this.clicked_heading.push(heading);
  }

  exportToExcel(): void {
    this.excelService.generateExcel("single", this.columnDS, this.dialogData.row, this.exportHeader, this.dialogData.type + "_" + this.dialogData.row._id);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
