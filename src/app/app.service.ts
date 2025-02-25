import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AppService {

  private apiUrl = environment.production ? environment.prod_apiUrl : environment.local_apiUrl;  // Backend URL
  private token: string | null = null;
  public saving = false;
  user: any = null;

  constructor(private http: HttpClient, private router: Router) {
    this.TokenInit();
  }
  public httpHeaders: any;
  orderDS: any[] = [
    { colname: "1", name: 'Sales', heading: true, width: '100%' },
    { colname: 'cycletime', name: 'Cycle Time', autofill: true, manual: true, displayCol: true, right: 'Sales' },// manual: true : for automatic changes where calculaton required on report
    { colname: 'po_final_date', name: 'PO Finalization Date', datefill: true, datepicker: true, right: 'Sales' },
    { colname: 'wo_number', name: 'Work Order No.', autofill: true, displayCol: true, right: 'Sales' },
    { colname: 'brand_name', name: 'Brand Name', autocomplete: true, selection_list: [], displayCol: true, right: 'Sales', removeColumnMater: true },

    //composition master - 
    { colname: 'composition_code', name: 'Compostion Code', autocomplete: true, selection_list: [], master: true, displayCol: true, right: 'Sales' },
    { colname: 'composition_generic_name', name: 'Generic Name', autofill: true, width: '100%', displayCol: true, right: 'Sales' },
    { colname: 'therapeutic_use', name: 'Therapeutic Use', autofill: true, right: 'Sales' },
    { colname: 'product_type', name: 'Product Type', autofill: true, displayCol: true, right: 'Sales' },
    { colname: 'cap_tab_size', name: 'Tab/Capsule Size', autofill: true, right: 'Sales' },
    //--------------------

    { colname: 'pack_type', name: 'Pack Type', autocomplete: true, selection_list: [], displayCol: true, right: 'Sales' },
    { colname: 'order_qty', name: 'Order Qty', input_field: true, displayCol: true, right: 'Sales' },
    { colname: 'order_type', name: 'Order Type', autocomplete: true, selection_list: [], displayCol: true, right: 'Sales' },
    { colname: 'qty_in_tabs', name: 'Qty In Tabs', autofill: true, displayCol: true, right: 'Sales' },
    { colname: 'balance_qty', name: 'Balance Qty', autofill: true, right: 'Sales' },
    { colname: 'mrp', name: 'MRP', input_field: true, right: 'Sales' },
    { colname: 'strip_bottle_tube_type', name: 'Strip/Bottle/Tube Type', autocomplete: true, selection_list: [], right: 'Sales' },
    { colname: 'base_foil_sticker_type', name: 'Base Foil/Sticker Type', autocomplete: true, selection_list: [], right: 'Sales' },
    { colname: 'base_foil_recieved', name: 'Base Foil Received', right: 'Sales' },
    { colname: 'dye', name: 'Dye', autocomplete: true, selection_list: [], right: 'Sales' },

    //packaging master -
    { colname: 'packaging_code', name: 'Packing Code', autocomplete: true, selection_list: [], master: true, right: 'Sales' },
    { colname: 'packaging', name: 'Packing', autofill: true, right: 'Sales' },
    { colname: 'packaging_type', name: 'Packing Type', autofill: true, right: 'Sales' },
    { colname: 'leading_brand', name: 'Leading Brand', autofill: true, right: 'Sales' },
    { colname: 'foil_size', name: 'Foil Size', autofill: true, right: 'Sales' },
    { colname: 'changepart_number', name: 'Changepart Number', autofill: true, right: 'Sales' },
    { colname: 'strip_size', name: 'Strip Size', autofill: true, right: 'Sales' },
    { colname: 'stereo_size', name: 'Stereo Size', autofill: true, right: 'Sales' },
    { colname: 'base_foil_size_color', name: 'Pvc/Base Foil Size & Color', autofill: true, right: 'Sales' },
    { colname: 'carton_type', name: 'Carton Type', autofill: true, right: 'Sales' },
    { colname: 'carton_size_inner', name: 'Carton Size Inner', autofill: true, right: 'Sales' },
    { colname: 'carton_size_outer', name: 'Carton Size Outer', autofill: true, right: 'Sales' },
    { colname: 'shipper_size', name: 'Shipper Size', autofill: true, right: 'Sales' },
    //-------------------
    { colname: 'ctn_required', name: 'Unit Carton Required', width: '100%', toggle: true, toggle_value: ["Not Required", "Required"], right: 'Sales' },
    { colname: "2", name: 'Store', heading: true, width: '100%' },
    { colname: 'rm_issue', name: 'RM Issue', width: '100%', toggle: true, toggle_value: ["Yes", "No"], right: 'Store' },
    { colname: 'pm_issue', name: 'PM Issue', width: '100%', toggle: true, toggle_value: ["Yes", "No"], right: 'Store' },

    { colname: "3", name: 'Production', heading: true, width: '100%' },
    { colname: 'wip', name: 'WIP', autocomplete: true, selection_list: [], right: 'Production' },

    { colname: "4", name: 'Dispatch', heading: true, width: '100%' },
    { colname: 'rfd', name: 'RFD Qty', input_field: true, right: 'Dispatch' },
    { colname: 'dispatch', name: 'Dispatch Qty', input_field: true, right: 'Dispatch' },

    { colname: "5", name: 'Purchase', heading: true, width: '100%' },
    { colname: 'tube_sticker_foil_ordered', name: 'Ordered Tube/Sticker/Foil', right: 'Purchase', input_field: true },
    { colname: 'tube_sticker_foil_recieved', name: 'Received Tube/Sticker/Foil', right: 'Purchase', input_field: true },
    { colname: 'outer_carton_ordered', name: 'Ordered Outer Carton', right: 'Purchase', input_field: true },
    { colname: 'outer_carton_recieved', name: 'Received Outer Carton', right: 'Purchase', input_field: true },
    { colname: 'unit_carton_ordered', name: 'Ordered Unit Carton', right: 'Purchase', input_field: true },
    { colname: 'unit_carton_recieved', name: 'Received Unit Carton', right: 'Purchase', input_field: true },
    { colname: 'party_name', name: 'Party Name', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'marketed_by', name: 'Marketed By', autocomplete: true, selection_list: [] },
    { colname: 'marketed_by_address', name: 'Marketed By Address' },
    { colname: 'drug_marketed_by_address', name: 'Drug License For Marketed By Address' },
    { colname: 'drug_billing_address', name: 'Drug license for Billing Address' },
    { colname: 'gst_billing_address', name: 'GST For Billing Address' },


    { colname: 'rate_box', name: 'Rate/Box' },
    { colname: 'bill_to', name: 'Bill To' },
    { colname: 'product_status', name: 'Product Status' },
    { colname: 'mfg_process_status', name: 'MFG Process Status' },
    { colname: 'pm_status', name: 'PM Status' },
    { colname: 'batch_number', name: 'Batch No.', input_field: true },
    { colname: 'yield', name: 'Yield in %', autofill: true, default: 0 },
    { colname: 'order_status', name: 'Order Status', autofill: true, default: 'Pending', displayCol: true },
    { colname: 'remarks', name: 'Remarks', input_field: true },
  ];
  artDS: any[] = [
    { colname: 'artwork_code', name: 'Artwork Code', autofill: true, displayCol: true },
    { colname: 'completion_date', name: 'Completion Date', datepicker: true, datefill: true },
    { colname: 'order_type', name: 'Order Type', autofill: true, displayCol: true },
    { colname: 'party_name', name: 'Party Name', autofill: true, displayCol: true },
    { colname: 'brand_name', name: 'Brand Name', autofill: true, displayCol: true },

    { colname: 'carton_artwork_code_inner', name: 'Carton Inner Artwork Code', autofill: true },
    { colname: 'carton_artwork_code_outer', name: 'Carton Outer Artwork Code', autofill: true },
    { colname: 'tube_sticker_foil_artwork_code', name: 'Tube/Sticker/Foil Artwork Code', autofill: true },


    { colname: 'composition_generic_name', name: 'Generic Name', autofill: true, input_field: true, width: '100%' },
    { colname: 'product_type', name: 'Product Type', autofill: true, input_field: true },
    { colname: 'pack_type', name: 'Pack Type', autofill: true, input_field: true },

    { colname: 'foil_size', name: 'Foil Size', autofill: true, input_field: true },

    { colname: 'carton_printed_by', name: 'Carton Printed By', input_field: true },
    { colname: 'tube_sticker_foil_printed_by', name: 'Tube/Sticker/Foil Printed By', input_field: true },

    { colname: 'qc_approve_status', name: 'QC Approve Status', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'artwork_status', name: 'Artwork Status', width: '100%', toggle: true, toggle_value: ["Pending", "Complete"], displayCol: true },
    { colname: 'carton_artwork_inner', name: 'Carton Inner Artwork', image: true },
    { colname: 'carton_artwork_outer', name: 'Carton Outer Artwork', image: true },
    { colname: 'tube_sticker_foil_artwork', name: 'Tube/Sticker/Foil Artwork', image: true },
  ];

  rmDS: any[] = [
    { colname: 'party_name', name: 'Party Name', autofill: true, displayCol: true },
    { colname: 'wo_number', name: 'WO No', order_master: true, master: true, autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'brand_name', name: 'Product Name', autofill: true, displayCol: true }, // brand name == product name
    { colname: 'po_number', name: 'PO Number', input_field: true, displayCol: true },
    { colname: 'po_date', name: 'PO Date', datepicker: true, displayCol: true, datefill: true },

    // Item Master
    { colname: 'category', name: 'Category', autofill: true, displayCol: true },
    { colname: 'rm_item_name', name: 'RM Name', master: true, width: '100%', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'required_make', name: 'Required Make', autofill: true },
    { colname: 'po_quantity', name: 'PO Quantity', input_field: true, displayCol: true },
    { colname: 'unit', name: 'Unit', autofill: true, displayCol: true },
    // -----------

    { colname: 'rate', name: 'Rate', input_field: true },
    { colname: 'broker', name: 'Broker', autocomplete: true, selection_list: [] },
    { colname: 'logistic', name: 'Logistic', autocomplete: true, selection_list: [] },
    { colname: 'pay', name: 'Pay', input_field: true },
    { colname: 'qty_recieved', name: 'Received Qty', input_field: true, displayCol: true },
    { colname: 'status', name: 'Status', input_field: true, displayCol: true },
    { colname: 'pending', name: 'Pending', autofill: true },
    { colname: 'remarks', name: 'Remarks', input_field: true }
  ];
  pmDS: any[] = [
    { colname: 'pm_item_name', name: 'PM Name', master: true, width: '100%', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'wo_number', name: 'WO No', order_master: true, master: true, autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'brand_name', name: 'Product Name', autofill: true, displayCol: true }, // brand name == product name
    { colname: 'seniority', name: 'Seniority', autofill: true, displayCol: true }, // diff today date - pm date
    { colname: 'supplier', name: 'Supplier', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'po_number', name: 'PO Number', input_field: true, displayCol: true },
    { colname: 'po_date', name: 'PO Date', datepicker: true, displayCol: true, datefill: true },
    { colname: 'dye', name: 'Dye', autofill: true },
    { colname: 'carton_size_inner', name: 'Carton Size Inner', autofill: true },
    { colname: 'carton_size_outer', name: 'Carton Size Outer', autofill: true },
    { colname: 'pack_type', name: 'Pack Type', autofill: true, displayCol: true },
    { colname: 'po_quantity', name: 'PO Quantity', displayCol: true }, 
    { colname: 'rate', name: 'Rate', input_field: true },
    { colname: 'order_type', name: 'Order Type', autofill: true },
    { colname: 'specification', name: 'Specification', input_field: true },
    { colname: 'qty_recieved', name: 'Received Qty', input_field: true, displayCol: true },
    { colname: 'pending', name: 'Pending Qty', autofill: true, displayCol: true }, // order qty - recvd qty
    { colname: 'status', name: 'Status', input_field: true, displayCol: true },
    { colname: 'remarks', name: 'Remarks', input_field: true }
  ];
  ppic_wo_ds: any[] = [
    { colname: 'wo_number', name: 'Work Order No.', width: '100%', autofill: true },
    { colname: 'item_name', name: 'RM/PM Name', width: '100%', autofill: true },
    { colname: 'calc_offset', name: 'Qty For 1 Lakh', input_field: true },
    { colname: 'required_stock', name: 'Required Stock ', autofill: true },
    { colname: 'rate', name: 'Rate of RM/PM', autofill: true },
    { colname: 'present_stock', name: 'Present Stock ', autofill: true },
    { colname: 'transit', name: 'In Transit', autofill: true },
    { colname: 'shortage', name: 'Shortage', autofill: true },
  ]
  //underTestStock: any[] = [
  //  { colname: 'rm_item_name', name: 'Item Name', width: '100%', autofill: true },
  //  { colname: 'rm_batch', name: 'Batch', input_field: true },
  //  { colname: 'qty_recieved', name: 'Qty Recieved', autofill: true },
  //  { colname: 'qc_approve_status', name: 'QC Approve Status', autocomplete: true, selection_list: [] }
  //]

  //shortagesDS: any[] = [ // one of static ds
  //  { colname: 'rm_item_name', name: 'Item Name', width: '100%', autofill: true },
  //  { colname: 'required_stock', name: 'Required Qty (In KG)', autofill: true },
  //  { colname: 'present_stock', name: 'Present Stock', autofill: true },
  //  { colname: 'shortages', name: 'Shortages', autofill: true },
  //  { colname: 'po_quantity', name: 'PO Quantity', autofill: true },
  //  { colname: 'undertest', name: 'Undertest', autofill: true },
  //]

  allColumnMaster: any[] = [
    this.orderDS.filter(col => !(col.input_field || col.autofill || col.datepicker || col.master || col.toggle || col.image || col.removeColumnMater)),
    this.rmDS.filter(col => !(col.input_field || col.autofill || col.datepicker || col.master || col.toggle || col.image || col.removeColumnMater)),
    this.pmDS.filter(col => !(col.input_field || col.autofill || col.datepicker || col.master || col.toggle || col.image || col.removeColumnMater)),
    this.artDS.filter(col => !(col.input_field || col.autofill || col.datepicker || col.master || col.toggle || col.image || col.removeColumnMater)),
  ];

  // Linking Master -------------------------------
  compositionMaster: any[] = [
    { colname: 'composition_code', name: 'Compostion Code', autocomplete: true, selection_list: [], master: true, displayCol: true },
    { colname: 'composition_generic_name', name: 'Generic Name', autocomplete: true, selection_list: [], width: '100%', displayCol: true },
    { colname: 'therapeutic_use', name: 'Therapeutic Use', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'product_type', name: 'Product Type', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'cap_tab_size', name: 'Tab/Capsule Size', autocomplete: true, selection_list: [] },
    { colname: 'packaging_code', name: 'Packing Code', master: true, width: '100%', isarray: true }, // isarray: multiple selection
  ];
  packageMaster: any[] = [
    { colname: 'packaging_code', name: 'Packing Code', autocomplete: true, selection_list: [], master: true, displayCol: true },
    { colname: 'packaging', name: 'Packing', ph: '10x10', autofill: true, displayCol: true },
    { colname: 'packaging_type', name: 'Packing Type', ph: 'Alu Alu', autofill: true, displayCol: true },
    { colname: 'leading_brand', name: 'Leading Brand', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'foil_size', name: 'Foil Size', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'changepart_number', name: 'Changepart Number', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'strip_size', name: 'Strip Size', autocomplete: true, selection_list: [] },
    { colname: 'stereo_size', name: 'Stereo Size', autocomplete: true, selection_list: [] },
    { colname: 'base_foil_size_color', name: 'Pvc/Base Foil Size & Color', autocomplete: true, selection_list: [] },
    { colname: 'carton_type', name: 'Carton Type', autocomplete: true, selection_list: [] },
    { colname: 'carton_size_inner', name: 'Carton Size Inner', autocomplete: true, selection_list: [] },
    { colname: 'carton_size_outer', name: 'Carton Size Outer', autocomplete: true, selection_list: [] },
    { colname: 'shipper_size', name: 'Shipper Size', autocomplete: true, selection_list: [] },
  ];
  rmMaster: any[] = [
    { colname: 'rm_item_name', name: 'RM Item Name', master: true, width: '100%', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'category', name: 'Category', autocomplete: true, selection_list: [], width: '100%', displayCol: true },
    { colname: 'required_make', name: 'Required Make', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'unit', name: 'Unit', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'rate', name: 'Rate', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'present_stock', name: 'Present Stock', input_field: true, default: 0, displayCol: true }
  ]
  pmStockMaster: any[] = [
    { colname: 'pm_item_name', name: 'PM Stock Name', master: true, width: '100%', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'unit', name: 'Unit', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'rate', name: 'Rate', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'present_stock', name: 'Present Stock', input_field: true, default: 0, displayCol: true }
  ]
  brandStockMaster: any[] = [
    { colname: 'brand_name', name: 'Brand Name', master: true, width: '100%', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'rm_item_name_list', name: 'RM List', width: '100%', expansion_table: "brandStockMaster_RM", ds: [], rep_type: 'brand_master_rm' }, // expansion_table: table w expansion panel
    { colname: 'pm_item_name_list', name: 'PM List', width: '100%', expansion_table: "brandStockMaster_PM", ds: [], rep_type: 'brand_master_pm' }, // ds: table ds, rep_type: type used in report dlg comp
  ]
  brandStockMaster_RM: any[] = [
    { colname: 'rm_item_name', name: 'RM Item Name', width: '100%', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'calc_offset', name: 'RM Calculation Offset (Per 1 Lakh)', width: '100%', input_field: true, input_type: "number", displayCol: true },
  ]
  brandStockMaster_PM: any[] = [
    { colname: 'pm_item_name', name: 'PM Stock Name', width: '100%', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'calc_offset', name: 'PM Calculation Offset (Per 1 Lakh)', width: '100%', input_field: true, input_type: "number", displayCol: true },
  ]


  private TokenInit() {
    let token = sessionStorage.getItem("token") == null ? '' : sessionStorage.getItem("token");
    if (token != "") {
      token = "Bearer " + token;
      this.httpHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'Authorization': token,
      });
    }
    else {
      this.httpHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        'accept': 'application/json'
      });
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => errorMessage);
  }

  // Store token in local storage
  setToken(token: string) {
    this.token = token;
    sessionStorage.setItem('token', token);
    this.TokenInit();

  }

  // Get token from local storage
  getToken(): string | null {
    return this.token || sessionStorage.getItem('token');
  }
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token; // Check if token exists
  }

  logout() {
    this.token = null;
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    this.router.navigate(['/login']);
    this.TokenInit();

  }

  debounceSearch(callback: Function, delay: number) {
    let timer: any;
    return function (...args: any) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        callback(...args);
      }, delay);
    }
  }

  RegisterUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/registeruser`, user, { headers: this.httpHeaders })
      .pipe(
        catchError(this.handleError)
      );
  }

  UpdateUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/updateuser`, user, { headers: this.httpHeaders })
      .pipe(
        catchError(this.handleError)
      );
  }

  DeleteUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/deleteuser`, user, { headers: this.httpHeaders })
      .pipe(
        catchError(this.handleError)
      );
  }

  ChangeUserPassword(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/changepassword`, user, { headers: this.httpHeaders })
      .pipe(
        catchError(this.handleError)
      );
  }

  login(user: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/user/login`, user, { headers: this.httpHeaders })
      .pipe(
        catchError(this.handleError)
      );
  }

  GetAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/getAllUsers`, { headers: this.httpHeaders })
      .pipe(
        catchError(this.handleError)
      );
  }

  // master

  GetOrderMaster(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/master/getOrderMaster`, { headers: this.httpHeaders })
      .pipe(
        catchError(this.handleError)
      );
  }
  SetOrderMaster(master: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/master/setOrderMaster`, master, { headers: this.httpHeaders })
      .pipe(
        catchError(this.handleError)
      );
  }

  GetBOMMaster(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/master/getBom`, { headers: this.httpHeaders })
      .pipe(
        catchError(this.handleError)
      );
  }
  UpdateBOMMaster(master: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/master/updateBom`, master, { headers: this.httpHeaders })
      .pipe(
        catchError(this.handleError)
      );
  }

  GetAllLinkingMaster(view: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/master/getAllLinkingMaster`, { headers: this.httpHeaders, params: { view } })
      .pipe(
        catchError(this.handleError)
      );
  }
  GetLinkingMasterById(_id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/master/getLinkingMasterById`, { headers: this.httpHeaders, params: { _id } })
      .pipe(
        catchError(this.handleError)
      );
  }
  GetLinkingMasterByIds(view: string, _ids: string[], include_doc: boolean = true): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/master/getLinkingMasterByIds`, { headers: this.httpHeaders, params: { _ids, view, include_doc } })
      .pipe(
        catchError(this.handleError)
      );
  }
  CreateLinkingMaster(master: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/master/createLinkingMaster`, master, { headers: this.httpHeaders })
      .pipe(
        catchError(this.handleError)
      );
  }
  UpdateLinkingMaster(master: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/master/updateLinkingMaster`, master, { headers: this.httpHeaders })
      .pipe(
        catchError(this.handleError)
      );
  }
  DeleteLinkingMaster(master: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/master/deleteLinkingMaster`, master, { headers: this.httpHeaders })
      .pipe(
        catchError(this.handleError)
      );
  }

  GetImagesById(docId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/master/getImage`, { headers: this.httpHeaders, params: { docId } })
      .pipe(
        catchError(this.handleError)
      );
  }

  UploadImages(images: any): Observable<any> {
    const formData: FormData = new FormData();
    let tmp_http_head = new HttpHeaders({
      'enctype': 'multipart/form-data',
      'accept': 'application/json',
      'Authorization': this.httpHeaders.get('Authorization')
    });
    formData.append('_id', images._id);
    Object.keys(images.images).forEach(key => {
      const { file, base64 } = images.images[key];
      if (file && base64) {
        // Convert the base64 string to a Blob
        const binary = atob(base64);
        const array = [];
        for (let i = 0; i < binary.length; i++) {
          array.push(binary.charCodeAt(i));
        }
        const blob = new Blob([new Uint8Array(array)], { type: file.type });

        // Append as a Blob to FormData
        formData.append(key, blob, file.name);
      }
    });

    return this.http.post(`${this.apiUrl}/master/uploadImage`, formData, { headers: tmp_http_head })
      .pipe(
        catchError(this.handleError)
      );
  }

  // all report

  CreateReport(order: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/report/createReport`, order, { headers: this.httpHeaders })
      .pipe(
        catchError(this.handleError)
      );
  }
  UpdateReport(order: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/report/updateReport`, order, { headers: this.httpHeaders })
      .pipe(
        catchError(this.handleError)
      );
  }
  DeleteReport(order: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/report/deleteReport`, order, { headers: this.httpHeaders })
      .pipe(
        catchError(this.handleError)
      );
  }
  GetReportById(_id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/report/getReportById`, { headers: this.httpHeaders, params: { _id } })
      .pipe(
        catchError(this.handleError)
      );
  }
  GetAllReports(view: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/report/getAllReports`, { headers: this.httpHeaders, params: { view } })
      .pipe(
        catchError(this.handleError)
      );
  }

  // filter reports

  GetAllFilterReports(view: string, include_docs: boolean, date_range: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/report/getAllFilterReports`, { headers: this.httpHeaders, params: { view, include_docs, start: date_range?.start, end: date_range?.end } })
      .pipe(
        catchError(this.handleError)
      );
  }

  GetPendingQtyFiltered(view: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/report/getPendingQtyFiltered`, { headers: this.httpHeaders, params: { view } })
      .pipe(
        catchError(this.handleError)
      );
  }
  BulkAddDocuments(docs: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/report/bulkAddDocuments`, docs, { headers: this.httpHeaders })
      .pipe(
        catchError(this.handleError)
      );
  }

  getDateTimeString(unixtime: any = null) {
    let cur_date = unixtime ? new Date(unixtime) : new Date();
    return cur_date.getDate().toString().padStart(2, "0") + "/" +
      cur_date.getMonth().toString().padStart(2, "0") + "/" +
      cur_date.getFullYear() + " " +
      cur_date.toLocaleTimeString();
  }
}
