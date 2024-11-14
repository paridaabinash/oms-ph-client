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

  constructor(private http: HttpClient, private router: Router) { this.TokenInit(); }
  public httpHeaders: any;
  orderDS: any[] = [
    { colname: 'cycletime', name: 'Cycle Time', autofill: true, manual: true },// manual: true : for automatic changes where calculaton required on report
    { colname: 'po_final_date', name: 'PO Finalization Date', datefill: true, datepicker: true },
    { colname: 'wo_number', name: 'Work Order No.', autofill: true },
    { colname: 'brand_name', name: 'Brand Name', autocomplete: true, selection_list: [] },

    //composition master - 
    { colname: 'composition_code', name: 'Compostion Code', autocomplete: true, selection_list: [], master: true },
    { colname: 'composition_generic_name', name: 'Generic Name', autofill: true, width: '100%' },
    { colname: 'therapeutic_use', name: 'Therapeutic Use', autofill: true },
    { colname: 'product_type', name: 'Product Type', autofill: true },
    { colname: 'cap_tab_size', name: 'Tab/Capsule Size', autofill: true },
    //--------------------

    { colname: 'pack_type', name: 'Pack Type', autocomplete: true, selection_list: [] },
    { colname: 'order_qty', name: 'Order Qty', textonly: true },
    { colname: 'order_type', name: 'Order Type', autocomplete: true, selection_list: [] },
    { colname: 'qty_in_tabs', name: 'Qty In Tabs', autofill: true },
    { colname: 'wip', name: 'WIP', textonly: true },
    { colname: 'rfd', name: 'RFD', textonly: true },
    { colname: 'dispatch', name: 'Dispatch', textonly: true },
    { colname: 'balance_qty', name: 'Balance Qty', autofill: true },
    { colname: 'mrp', name: 'MRP', textonly: true },
    { colname: 'strip_bottle_tube_type', name: 'Strip/Bottle/Tube Type', autocomplete: true, selection_list: [] },
    { colname: 'base_foil_sticker_type', name: 'Base Foil/Sticker Type', autocomplete: true, selection_list: [] },
    { colname: 'base_foil_recieved', name: 'Base Foil Received' },
    { colname: 'dye', name: 'Dye', autocomplete: true, selection_list: [] },

    //packaging master -
    { colname: 'packaging_code', name: 'Packing Code', autocomplete: true, selection_list: [], master: true, },
    { colname: 'packaging', name: 'Packing', autofill: true },
    { colname: 'packaging_type', name: 'Packing Type', autofill: true },
    { colname: 'leading_brand', name: 'Leading Brand', autofill: true },
    { colname: 'foil_size', name: 'Foil Size', autofill: true },
    { colname: 'changepart_number', name: 'Changepart Number', autofill: true },
    { colname: 'strip_size', name: 'Strip Size', autofill: true },
    { colname: 'stereo_size', name: 'Stereo Size', autofill: true },
    { colname: 'base_foil_size_color', name: 'Pvc/Base Foil Size & Color', autofill: true },
    { colname: 'carton_type', name: 'Carton Type', autofill: true },
    { colname: 'carton_size_inner', name: 'Carton Size Inner', autofill: true },
    { colname: 'carton_size_outer', name: 'Carton Size Outer', autofill: true },
    { colname: 'shipper_size', name: 'Shipper Size', autofill: true },
    //-------------------
    { colname: 'ctn_required', name: 'Unit Carton Required', width: '100%', toggle: true, toggle_value: ["Not Required", "Required"] },
    { colname: 'tube_sticker_foil_ordered', name: 'Tube/Sticker/Foil Ordered' },
    { colname: 'tube_sticker_foil_recieved', name: 'Tube/Sticker/Printing Foil Received' },
    { colname: 'carton_ordered', name: 'Carton Ordered' },
    { colname: 'outer_carton_recieved', name: 'Outer Carton Received' },
    { colname: 'unit_carton_recieved', name: 'Unit Carton Received' },
    { colname: 'party_name', name: 'Party Name', autocomplete: true, selection_list: [] },
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
    { colname: 'batch_number', name: 'Batch No.', textonly: true },
    { colname: 'yield', name: 'Yield in %', autofill: true, default: 0 },
    { colname: 'order_status', name: 'Order Status', autofill: true, default: 'Pending' },
    { colname: 'remarks', name: 'Remarks', textonly: true },
  ];
  artDS: any[] = [
    { colname: 'artwork_code', name: 'Artwork Code', autofill: true },
    { colname: 'completion_date', name: 'Completion Date', datepicker: true, datefill: true },
    { colname: 'order_type', name: 'Order Type', autofill: true },
    { colname: 'party_name', name: 'Party Name', autofill: true },
    { colname: 'brand_name', name: 'Brand Name', autofill: true },

    { colname: 'carton_artwork_code_inner', name: 'Carton Inner Artwork Code', autofill: true },
    { colname: 'carton_artwork_code_outer', name: 'Carton Outer Artwork Code', autofill: true },
    { colname: 'tube_sticker_foil_artwork_code', name: 'Tube/Sticker/Foil Artwork Code', autofill: true },


    { colname: 'composition_generic_name', name: 'Generic Name', autofill: true, textonly: true, width: '100%' },
    { colname: 'product_type', name: 'Product Type', autofill: true, textonly: true },
    { colname: 'pack_type', name: 'Pack Type', autofill: true, textonly: true },

    { colname: 'foil_size', name: 'Foil Size', autofill: true, textonly: true },

    { colname: 'carton_printed_by', name: 'Carton Printed By', textonly: true },
    { colname: 'tube_sticker_foil_printed_by', name: 'Tube/Sticker/Foil Printed By', textonly: true },

    { colname: 'qc_approve_status', name: 'QC Approve Status', autocomplete: true, selection_list: [] },
    { colname: 'artwork_status', name: 'Artwork Status', width: '100%', toggle: true, toggle_value: ["Incomplete", "Complete"] },
    { colname: 'carton_artwork_inner', name: 'Carton Inner Artwork', image: true },
    { colname: 'carton_artwork_outer', name: 'Carton Outer Artwork', image: true },
    { colname: 'tube_sticker_foil_artwork', name: 'Tube/Sticker/Foil Artwork', image: true },
  ];
  rmDS: any[] = [
    { colname: 'party_name', name: 'Party Name', autocomplete: true, selection_list: [] },
    { colname: 'po_number', name: 'PO Number', textonly: true },
    { colname: 'order_date', name: 'Order Date', datepicker: true },

    // Item Master
    { colname: 'category', name: 'Category', autofill: true },
    { colname: 'rm_item_name', name: 'Item Name', master: true, width: '100%', autocomplete: true, selection_list: [] },
    { colname: 'required_make', name: 'Required Make', autofill: true },
    { colname: 'po_quantity', name: 'PO Quantity', textonly: true },
    { colname: 'unit', name: 'Unit', autofill: true },
    // -----------

    { colname: 'rate', name: 'Rate', textonly: true },
    { colname: 'broker', name: 'Broker', autocomplete: true, selection_list: [] },
    { colname: 'logistic', name: 'Logistic', autocomplete: true, selection_list: [] },
    { colname: 'pay', name: 'Pay', textonly: true },
    { colname: 'qty_recieved', name: 'Qty Recieved', textonly: true },
    { colname: 'status', name: 'Status', textonly: true },
    { colname: 'pending', name: 'Pending', autofill: true },
    { colname: 'remarks', name: 'Remarks', textonly: true }
  ];
  pmDS: any[] = [
    { colname: 'pm_item', name: 'Item', autofill: true },
    { colname: 'seniority', name: 'Seniority', autofill: true }, // diff today date - pm date
    { colname: 'supplier', name: 'Supplier', autocomplete: true, selection_list: [] },
    { colname: 'wo_number', name: 'WO No', autofill: true },
    { colname: 'pm_no', name: 'PM No', textonly: true },
    { colname: 'po_date', name: 'PO Date', datepicker: true },
    { colname: 'brand_name', name: 'Product Name', autofill: true }, // brand name == product name
    { colname: 'dye', name: 'Dye', autofill: true },
    { colname: 'carton_size_inner', name: 'Carton Size Inner', autofill: true },
    { colname: 'carton_size_outer', name: 'Carton Size Outer', autofill: true },
    { colname: 'pack_type', name: 'Pack Type', autofill: true },
    { colname: 'order_qty', name: 'Order Qty', autofill: true }, // autofill from ppic report
    { colname: 'rate', name: 'Rate', textonly: true },
    { colname: 'order_type', name: 'Order Type', autofill: true },
    { colname: 'specification', name: 'Specification', textonly: true },
    { colname: 'recieved_qty', name: 'Received Qty', textonly: true },
    { colname: 'pending_qty', name: 'Pending Qty', autofill: true }, // order qty - recvd qty
    { colname: 'status', name: 'Status', textonly: true },
    { colname: 'remarks', name: 'Remarks', textonly: true }
  ];

  underTestStock: any[] = [
    { colname: 'rm_item_name', name: 'Item Name', width: '100%', autofill: true },
    { colname: 'rm_batch', name: 'Batch', textonly: true },
    { colname: 'qty_recieved', name: 'Qty Recieved', autofill: true },
    { colname: 'qc_approve_status', name: 'QC Approve Status', autocomplete: true, selection_list: [] }
  ]

  shortagesDS: any[] = [
    { colname: 'rm_item_name', name: 'Item Name', width: '100%', autofill: true },
    { colname: 'required_stock', name: 'Required Qty (In KG)', autofill: true },
    { colname: 'present_stock', name: 'Present Stock', autofill: true },
    { colname: 'shortages', name: 'Shortages', autofill: true },
    { colname: 'po_quantity', name: 'PO Quantity', autofill: true },
    { colname: 'undertest', name: 'Undertest', autofill: true },
  ]

  allColumnMaster: any[] = [
    this.orderDS.filter(col => !(col.textonly || col.autofill || col.datepicker || col.master || col.toggle || col.image)),
    this.rmDS.filter(col => !(col.textonly || col.autofill || col.datepicker || col.master || col.toggle || col.image)),
    this.pmDS.filter(col => !(col.textonly || col.autofill || col.datepicker || col.master || col.toggle || col.image)),
    this.artDS.filter(col => !(col.textonly || col.autofill || col.datepicker || col.master || col.toggle || col.image)),
  ];

  // Linking Master -------------------------------
  compositionMaster: any[] = [
    { colname: 'composition_code', name: 'Compostion Code', autocomplete: true, selection_list: [], master: true },
    { colname: 'composition_generic_name', name: 'Generic Name', autocomplete: true, selection_list: [], width: '100%' },
    { colname: 'therapeutic_use', name: 'Therapeutic Use', autocomplete: true, selection_list: [] },
    { colname: 'product_type', name: 'Product Type', autocomplete: true, selection_list: [] },
    { colname: 'cap_tab_size', name: 'Tab/Capsule Size', autocomplete: true, selection_list: [] },
    { colname: 'packaging_code', name: 'Packing Code', master: true, width: '100%', isarray: true }, // isarray: multiple selection
    { colname: 'rm_item_name', name: 'RM Item Name', width: '100%', isarray: true }
  ];
  packageMaster: any[] = [
    { colname: 'packaging_code', name: 'Packing Code', autocomplete: true, selection_list: [], master: true },
    { colname: 'packaging', name: 'Packing', ph: '10x10', autofill: true },
    { colname: 'packaging_type', name: 'Packing Type', ph: 'Alu Alu', autofill: true },
    { colname: 'leading_brand', name: 'Leading Brand', autocomplete: true, selection_list: [] },
    { colname: 'foil_size', name: 'Foil Size', autocomplete: true, selection_list: [] },
    { colname: 'changepart_number', name: 'Changepart Number', autocomplete: true, selection_list: [] },
    { colname: 'strip_size', name: 'Strip Size', autocomplete: true, selection_list: [] },
    { colname: 'stereo_size', name: 'Stereo Size', autocomplete: true, selection_list: [] },
    { colname: 'base_foil_size_color', name: 'Pvc/Base Foil Size & Color', autocomplete: true, selection_list: [] },
    { colname: 'carton_type', name: 'Carton Type', autocomplete: true, selection_list: [] },
    { colname: 'carton_size_inner', name: 'Carton Size Inner', autocomplete: true, selection_list: [] },
    { colname: 'carton_size_outer', name: 'Carton Size Outer', autocomplete: true, selection_list: [] },
    { colname: 'shipper_size', name: 'Shipper Size', autocomplete: true, selection_list: [] },
  ];
  rmMaster: any[] = [
    { colname: 'rm_item_name', name: 'Item Name', master: true, width: '100%', autocomplete: true, selection_list: [] },
    { colname: 'category', name: 'Category', autocomplete: true, selection_list: [], width: '100%' },
    { colname: 'required_make', name: 'Required Make', autocomplete: true, selection_list: [] },
    { colname: 'unit', name: 'Unit', autocomplete: true, selection_list: [] },
    { colname: 'rm_calc_offset', name: 'RM Calculation Offset', textonly: true },
  ]
  pmStockMaster: any[] = [
    { colname: 'rm_stock_name', name: 'RM Stock Name', master: true, width: '100%', autocomplete: true, selection_list: [] },
    { colname: 'unit', name: 'Unit', autocomplete: true, selection_list: [] },
    { colname: 'present_stock', name: 'Present Stock', textonly: true, default: 0 },
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

  GetAllLinkingMaster(type: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/master/getAllLinkingMaster`, { headers: this.httpHeaders, params: { type } })
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
  GetLinkingMasterByIds(type: string, _ids: string[]): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/master/getLinkingMasterByIds`, { headers: this.httpHeaders, params: { _ids, type } })
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

  GetAllFilterReports(view: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/report/getAllFilterReports`, { headers: this.httpHeaders, params: { view } })
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
}
