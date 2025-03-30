import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { shareReplay, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AppService {

  private apiUrl = environment.production ? environment.prod_apiUrl : environment.local_apiUrl;  // Backend URL
  private token: string | null = null;
  public saving = false;
  user: any = null;

  public isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
  constructor(private http: HttpClient, private router: Router,
    private breakpointObserver: BreakpointObserver) {
    this.TokenInit();
  }

  public httpHeaders: any;

  access: any = {
    "Sales": { order_report: true },
    "Purchase": { order_report: true, rm_report: true, pm_report: true },
    "Artwork": { art_report: true },
    "Store": { order_report: true, rm_report: true, pm_report: true, rm_master: true, pm_stock_master: true },
    "Production": { order_report: true },
    "Packing": { order_report: true },
    "Packaging Material": { order_report: true },
    "PPIC": { order_report: true, rm_report: true, pm_report: true, ppic_report: true },
    "Dispatch": { order_report: true }
  }

  reportAddAccess: any = {
    "Sales": { order_report: true },
    "Purchase": { rm_report: true, pm_report: true },
    "Artwork": { },
    "Store": { },
    "Production": {},
    "Packing": { },
    "Packaging Material": { },
    "PPIC": { rm_report: true, pm_report: true },
    "Dispatch": { }
  }

  sales_columns: any[] = [
    { colname: "h1", name: 'Sales', heading: true, width: '100%' },
    { colname: 'cycletime', name: 'Cycle Time', autofill: true, manual: true, displayCol: true, right: 'Sales' },// manual: true : for automatic changes where calculaton required on report
    { colname: 'po_final_date', name: 'PO Finalization Date', datefill: true, datepicker: true, right: 'Sales' },
    { colname: 'wo_number', name: 'Work Order No.', autofill: true, displayCol: true, right: 'Sales' },
    { colname: 'order_type', name: 'Order Type', autocomplete: true, selection_list: [], displayCol: true, right: 'Sales', required: true },
    { colname: 'brand_name', name: 'Brand Name', autocomplete: true, selection_list: [], master: true, displayCol: true, right: 'Sales', disable_after: true, required: true },

    { colname: "hr1", horizontal_line: true, width: '100%' },

    //composition master - 
    { colname: 'composition_code', name: 'Compostion Code', autocomplete: true, selection_list: [], master: true, displayCol: true, right: 'Sales', disable_after: true, required: true },
    { colname: 'composition_generic_name', name: 'Generic Name', autofill: true, width: '100%', displayCol: true, right: 'Sales' },
    { colname: 'therapeutic_use', name: 'Therapeutic Use', autofill: true, right: 'Sales' },
    { colname: 'product_type', name: 'Product Type', autofill: true, displayCol: true, right: 'Sales' },
    { colname: 'cap_tab_size', name: 'Tab/Capsule Size', autofill: true, right: 'Sales' },
    //--------------------

    { colname: "hr2", horizontal_line: true, width: '100%' },

    //packaging master -
    { colname: 'packaging_code', name: 'Packing Code', autocomplete: true, selection_list: [], master: true, right: 'Sales', required: true, disable_after: true },
    { colname: 'packaging', name: 'Packing', autofill: true, right: 'Sales' },
    { colname: 'packaging_type', name: 'Packing Type', autofill: true, right: 'Sales' },
    { colname: 'leading_brand', name: 'Leading Brand', autofill: true, right: 'Sales' },
    { colname: 'foil_size', name: 'Foil Size', autofill: true, right: 'Sales' },
    { colname: 'changepart_number', name: 'Changepart Number', autofill: true, right: 'Sales' },
    { colname: 'strip_size', name: 'Strip Size', autofill: true, right: 'Sales' },
    { colname: 'stereo_size', name: 'Stereo Size', autofill: true, right: 'Sales' },
    { colname: 'base_foil_size_color', name: 'Pvc/Base Foil Size', autofill: true, right: 'Sales' },
    { colname: 'carton_size_inner', name: 'Carton Size Inner', autofill: true, right: 'Sales' },
    { colname: 'carton_size_outer', name: 'Carton Size Outer', autofill: true, right: 'Sales' },
    { colname: 'shipper_size', name: 'Shipper Size', autofill: true, right: 'Sales' },
    //-------------------
    { colname: "hr3", horizontal_line: true, width: '100%' },

    { colname: 'qty_in_tabs', name: 'Qty In Tabs', autofill: true, input_type: "number", displayCol: true, right: 'Sales' },
    { colname: 'balance_qty', name: 'Balance Qty', autofill: true, input_type: "number", right: 'Sales' },

    { colname: 'order_qty', name: 'Order Qty', input_field: true, input_type: "number", displayCol: true, right: 'Sales', required: true },
    { colname: 'mrp', name: 'MRP', input_field: true, right: 'Sales' },
    { colname: 'base_foil_color_specs', name: 'Base Foil Color Specs', autocomplete: true, selection_list: [], right: 'Sales' },
    { colname: 'carton_type', name: 'Carton Type', autocomplete: true, selection_list: [], right: 'Sales' },
    { colname: 'strip_bottle_tube_type', name: 'Strip/Bottle/Tube Type', autocomplete: true, selection_list: [], right: 'Sales' },
    { colname: 'base_foil_sticker_type', name: 'Base Foil/Sticker Type', autocomplete: true, selection_list: [], right: 'Sales' },
    { colname: 'dye', name: 'Dye', autocomplete: true, selection_list: [], right: 'Sales' },
    { colname: 'party_name', name: 'Party Name', autocomplete: true, selection_list: [], displayCol: true, right: 'Sales' },
    { colname: 'marketed_by', name: 'Marketed By', autocomplete: true, selection_list: [], right: 'Sales' },
    { colname: 'marketed_by_address', name: 'Marketed By Address', right: 'Sales' },
    { colname: 'drug_marketed_by_address', name: 'Drug License For Marketed By Address', right: 'Sales' },
    { colname: 'drug_billing_address', name: 'Drug license for Billing Address', right: 'Sales' },
    { colname: 'gst_billing_address', name: 'GST For Billing Address', right: 'Sales' },
    { colname: 'rate_box', name: 'Rate/Box', input_field: true, input_type: "number", right: 'Sales' },
    { colname: 'bill_to', name: 'Bill To', right: 'Sales' },
    { colname: 'billing_price', name: 'Billing Price', right: 'Sales' },
    { colname: 'ctn_required', name: 'Unit Carton Required', width: '100%', toggle: true, toggle_value: ["Not Required", "Required"], default: "Not Required", right: 'Sales' }
  ]

  orderDS: any[] = [
    ...this.sales_columns,
    { colname: "h2", name: 'Store', heading: true, width: '100%' },
    { colname: 'rm_issue', name: 'RM Issue', width: '100%', toggle: true, toggle_value: ["Yes", "No"], default: "No", right: 'Store' },
    { colname: 'pm_issue', name: 'PM Issue', width: '100%', toggle: true, toggle_value: ["Yes", "No"], default: "No", right: 'Store' },

    { colname: "h3", name: 'Production', heading: true, width: '100%' },
    { colname: 'wip', name: 'WIP', autocomplete: true, selection_list: [], right: 'Production' },

    { colname: "h4", name: 'Packing', heading: true, width: '100%' },
    { colname: 'rfd', name: 'RFD Qty', input_field: true, right: 'Packing', input_type: "number" },

    { colname: "h5", name: 'Dispatch', heading: true, width: '100%' },
    { colname: 'dispatch', name: 'Dispatch Qty', input_field: true, right: 'Dispatch', input_type: "number" },

   
    { colname: "h6", name: 'Purchase', heading: true, width: '100%' },
    { colname: 'tube_sticker_foil_ordered', name: 'Ordered Tube/Sticker/Foil', right: 'Purchase', input_field: true },
    { colname: 'tube_sticker_foil_recieved', name: 'Received Tube/Sticker/Foil', right: 'Purchase', input_field: true },
    { colname: 'outer_carton_ordered', name: 'Ordered Outer Carton', right: 'Purchase', input_field: true },
    { colname: 'outer_carton_recieved', name: 'Received Outer Carton', right: 'Purchase', input_field: true },
    { colname: 'unit_carton_ordered', name: 'Ordered Unit Carton', right: 'Purchase', input_field: true },
    { colname: 'unit_carton_recieved', name: 'Received Unit Carton', right: 'Purchase', input_field: true },
    { colname: 'product_status', name: 'Product Status', right: 'Purchase' },
    { colname: 'mfg_process_status', name: 'MFG Process Status', right: 'Purchase' },
    { colname: 'pm_status', name: 'PM Status', right: 'Purchase' },
    { colname: 'batch_number', name: 'Batch No.', input_field: true, right: 'Purchase' },

    { colname: "hr4", horizontal_line: true, width: '100%' },
    { colname: 'yield', name: 'Yield in %', autofill: true, default: 0 },
    { colname: 'order_status', name: 'Order Status', autofill: true, default: 'Pending', displayCol: true },
    { colname: 'remarks', name: 'Additional Remarks', input_field: true },
  ];
  artDS: any[] = [

    { colname: 'artwork_code', name: 'Artwork Code', autofill: true, displayCol: true },
    { colname: 'completion_date', name: 'Completion Date', datepicker: true, datefill: true },

    { colname: 'carton_artwork_code_inner', name: 'Carton Inner Artwork Code' },
    { colname: 'carton_artwork_code_outer', name: 'Carton Outer Artwork Code' },
    { colname: 'tube_sticker_foil_artwork_code', name: 'Tube/Sticker/Foil Artwork Code' },
    { colname: 'base_foil_artwork_code', name: 'Base Foil Artwork Code' },

    { colname: 'carton_printed_by', name: 'Carton Printed By', input_field: true },
    { colname: 'tube_sticker_foil_printed_by', name: 'Tube/Sticker/Foil Printed By', input_field: true },

    { colname: 'qc_approve_status', name: 'QC Approve Status', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'artwork_status', name: 'Artwork Status', width: '100%', toggle: true, toggle_value: ["Pending", "Complete"], default: "Pending", displayCol: true },
    { colname: 'carton_artwork_inner', name: 'Carton Inner Artwork', image: true},
    { colname: 'carton_artwork_outer', name: 'Carton Outer Artwork', image: true, required: true },
    { colname: 'tube_sticker_foil_artwork', name: 'Tube/Sticker/Foil Artwork', image: true, required: true },
    { colname: 'base_foil_artwork', name: 'Base Foil Artwork', image: true },

    { colname: "hr1", horizontal_line: true, width: '100%' },
    ...(this.sales_columns.filter(el => !el.horizontal_line && !el.heading && el.colname != "cycletime" && el.colname != "po_final_date").map(el => { return { colname: el.colname, name: el.name, width: el?.width, autofill: true, displayCol: true } })),
  ];

  rmDS: any[] = [
    { colname: 'wo_number', name: 'WO No', order_master: true, master: true, autocomplete: true, selection_list: [], displayCol: true, disable_after: true, required: true },
    { colname: 'brand_name', name: 'Product Name', autofill: true, displayCol: true, disable_after: true }, // brand name == product name

    // Item Master
    { colname: 'rm_item_name', name: 'RM Name', master: true, width: '100%', autocomplete: true, selection_list: [], displayCol: true, disable_after: true, required: true },
    { colname: 'category', name: 'Category', autofill: true },
    { colname: 'required_make', name: 'Required Make', autofill: true },
    { colname: 'po_quantity', name: 'PO Quantity', input_field: true, displayCol: true, disable_after: true, input_type: "number", required: true },
    { colname: 'unit', name: 'Unit', autofill: true, displayCol: true },
    // -----------

    { colname: 'party_name', name: 'Party Name', autofill: true },
    { colname: 'po_number', name: 'PO Number', input_field: true, displayCol: true },
    { colname: 'po_date', name: 'PO Date', datepicker: true, displayCol: true, datefill: true },
    { colname: 'rate', name: 'Rate', input_field: true, displayCol: true },
    { colname: 'broker', name: 'Broker', autocomplete: true, selection_list: [] },
    { colname: 'logistic', name: 'Logistic', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'pay', name: 'Pay', input_field: true, displayCol: true },
    { colname: 'qty_recieved', name: 'Received Qty', input_field: true, displayCol: true, input_type: "number" },
    { colname: 'pending', name: 'Pending', autofill: true, displayCol: true },
    { colname: 'status', name: 'Status', input_field: true, displayCol: true },
    { colname: 'remarks', name: 'Remarks', input_field: true }
  ];
  pmDS: any[] = [
    { colname: 'wo_number', name: 'WO No', order_master: true, master: true, autocomplete: true, selection_list: [], displayCol: true, disable_after: true, required: true },
    { colname: 'brand_name', name: 'Product Name', autofill: true, displayCol: true, disable_after: true }, // brand name == product name
    { colname: 'pm_item_name', name: 'PM Name', master: true, width: '100%', autocomplete: true, selection_list: [], displayCol: true, disable_after: true, required: true },
    { colname: 'seniority', name: 'Seniority', autofill: true, displayCol: true }, // diff today date - pm date
    { colname: 'supplier', name: 'Supplier', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'po_number', name: 'PO Number', input_field: true, displayCol: true },
    { colname: 'po_date', name: 'PO Date', datepicker: true, displayCol: true, datefill: true },
    { colname: 'dye', name: 'Dye', autofill: true },
    { colname: 'carton_size_inner', name: 'Carton Size Inner', autofill: true, displayCol: true },
    { colname: 'carton_size_outer', name: 'Carton Size Outer', autofill: true, displayCol: true },
    { colname: 'packaging', name: 'Pack Type', autofill: true, displayCol: true },
    { colname: 'po_quantity', name: 'PO Quantity', displayCol: true, disable_after: true, input_type: "number", required: true }, 
    { colname: 'rate', name: 'Rate', input_field: true, displayCol: true },
    { colname: 'order_type', name: 'Order Type', autofill: true },
    { colname: 'specification', name: 'Specification', input_field: true, displayCol: true },
    { colname: 'qty_recieved', name: 'Received Qty', input_field: true, displayCol: true, input_type: "number" },
    { colname: 'pending', name: 'Pending Qty', autofill: true, displayCol: true }, // order qty - recvd qty
    { colname: 'status', name: 'Status', input_field: true, displayCol: true },
    { colname: 'remarks', name: 'Remarks', input_field: true }
  ];

  // Linking Master -------------------------------
  compositionMaster: any[] = [
    { colname: 'composition_code', name: 'Compostion Code', autocomplete: true, selection_list: [], master: true, displayCol: true, required: true },
    { colname: 'composition_generic_name', name: 'Generic Name', autocomplete: true, selection_list: [], width: '100%', displayCol: true },
    { colname: 'therapeutic_use', name: 'Therapeutic Use', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'product_type', name: 'Product Type', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'cap_tab_size', name: 'Tab/Capsule Size', autocomplete: true, selection_list: [], displayCol: true },
  ];
  packageMaster: any[] = [
    { colname: 'packaging_code', name: 'Packing Code', autocomplete: true, selection_list: [], master: true, displayCol: true, required: true },
    { colname: 'packaging', name: 'Packing', ph: 'Format: 10*10', autofill: true, displayCol: true },
    { colname: 'packaging_type', name: 'Packing Type', ph: 'Alu Alu', autofill: true, displayCol: true },
    { colname: 'leading_brand', name: 'Leading Brand', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'foil_size', name: 'Foil Size', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'changepart_number', name: 'Changepart Number', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'strip_size', name: 'Strip Size', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'stereo_size', name: 'Stereo Size', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'base_foil_size_color', name: 'Pvc/Base Foil Size', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'carton_size_inner', name: 'Carton Size Inner', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'carton_size_outer', name: 'Carton Size Outer', autocomplete: true, selection_list: [], displayCol: true },
    { colname: 'shipper_size', name: 'Shipper Size', autocomplete: true, selection_list: [], displayCol: true },
  ];
  rmMaster: any[] = [
    { colname: 'rm_item_name', name: 'RM Name', master: true, width: '100%', autocomplete: true, selection_list: [], displayCol: true, required: true, right: 'Admin' },
    { colname: 'category', name: 'Category', autocomplete: true, selection_list: [], width: '100%', displayCol: true, right: 'Admin' },
    { colname: 'required_make', name: 'Required Make', autocomplete: true, selection_list: [], displayCol: true, right: 'Admin' },
    { colname: 'unit', name: 'Unit', displayCol: true, right: 'Admin' },
    { colname: 'rate', name: 'Rate', displayCol: true, right: 'Admin' },
    { colname: 'present_stock', name: 'Present Stock', input_field: true, input_type: "number", default: 0, displayCol: true, required: true, right: 'Store' }
  ]
  pmStockMaster: any[] = [
    { colname: 'pm_item_name', name: 'PM Name', master: true, width: '100%', autocomplete: true, selection_list: [], displayCol: true, required: true, right: 'Admin' },
    { colname: 'unit', name: 'Unit', displayCol: true, right: 'Admin' },
    { colname: 'rate', name: 'Rate', displayCol: true, right: 'Admin' },
    { colname: 'present_stock', name: 'Present Stock', input_field: true, input_type: "number", default: 0, displayCol: true, required: true, right: 'Store' }
  ]
  brandStockMaster: any[] = [
    { colname: 'brand_name', name: 'Brand Name', master: true, width: '100%', autocomplete: true, selection_list: [], displayCol: true, required: true },
    { colname: 'packaging_code', name: 'Packing Code', master: true, width: '100%', isarray: true, required: true }, // isarray: multiple selection
    { colname: 'rm_item_name_list', name: 'RM List', width: '100%', expansion_table: "brandStockMaster_RM", ds: [], rep_type: 'brand_master_rm', default: [] }, // expansion_table: table w expansion panel
    { colname: 'pm_item_name_list', name: 'PM List', width: '100%', expansion_table: "brandStockMaster_PM", ds: [], rep_type: 'brand_master_pm', default: [] }, // ds: table ds, rep_type: type used in report dlg comp
  ]
  brandStockMaster_RM: any[] = [
    { colname: 'rm_item_name', name: 'RM Item Name', width: '100%', autocomplete: true, selection_list: [], strict_selection: true, displayCol: true, required: true },
    { colname: 'calc_offset', name: 'RM Calculation Offset (Per 1 Lakh)', width: '100%', input_field: true, input_type: "number", displayCol: true, required: true },
  ]
  brandStockMaster_PM: any[] = [
    { colname: 'pm_item_name', name: 'PM Stock Name', width: '100%', autocomplete: true, selection_list: [], strict_selection: true, displayCol: true, required: true },
    { colname: 'calc_offset', name: 'PM Calculation Offset (Per 1 Lakh)', width: '100%', input_field: true, input_type: "number", displayCol: true, required: true },
  ]

  excludedHistoryMaster: string[] = ["input_field", "autofill", "datepicker", "master", "toggle", "image", "removeColumnMater", "horizontal_line", "heading"];
  allColumnMaster: any[] = [
    this.orderDS.filter(col => !this.excludedHistoryMaster.some(exc => col.hasOwnProperty(exc))),
    this.rmDS.filter(col => !this.excludedHistoryMaster.some(exc => col.hasOwnProperty(exc))),
    this.pmDS.filter(col => !this.excludedHistoryMaster.some(exc => col.hasOwnProperty(exc))),
    this.artDS.filter(col => !this.excludedHistoryMaster.some(exc => col.hasOwnProperty(exc))),
    this.compositionMaster.filter(col => !this.excludedHistoryMaster.some(exc => col.hasOwnProperty(exc))),
    this.packageMaster.filter(col => !this.excludedHistoryMaster.some(exc => col.hasOwnProperty(exc))),
    this.rmMaster.filter(col => !this.excludedHistoryMaster.some(exc => col.hasOwnProperty(exc))),
    this.pmStockMaster.filter(col => !this.excludedHistoryMaster.some(exc => col.hasOwnProperty(exc))),
  ];

  ppic_wo_ds: any[] = [
    { colname: 'wo', name: 'Work Order No.' },
    { colname: 'item_name', name: 'RM/PM Name' },
    { colname: 'calc_offset', name: 'Qty For 1 Lakh' },
    { colname: 'required_stock', name: 'Required Stock' },
    { colname: 'rate', name: 'Rate of RM/PM' },
    { colname: 'present_stock', name: 'Present Stock' },
    { colname: 'transit', name: 'In Transit' },
    { colname: 'shortage', name: 'Shortage', highlight: true }
  ]

  ppic_all_rm: any[] = [
    { colname: 'rm_item_name', name: 'RM Name' },
    { colname: 'calc_offset', name: 'Qty For 1 Lakh' },
    { colname: 'required_stock', name: 'Required Stock' },
    { colname: 'rate', name: 'Rate' },
    { colname: 'present_stock', name: 'Present Stock' },
    { colname: 'transit', name: 'In Transit' },
    { colname: 'shortage', name: 'Shortage', highlight: true }
  ]

  ppic_all_pm: any[] = [
    { colname: 'pm_item_name', name: 'PM Name' },
    { colname: 'calc_offset', name: 'Qty For 1 Lakh' },
    { colname: 'required_stock', name: 'Required Stock' },
    { colname: 'rate', name: 'Rate' },
    { colname: 'present_stock', name: 'Present Stock' },
    { colname: 'transit', name: 'In Transit' },
    { colname: 'shortage', name: 'Shortage', highlight: true }
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

  limitDecimals(decimal: number, limit: number) {
    const fact = Math.pow(10, limit);
    return Math.round(decimal * fact) / fact;
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
  GetReportByIds(view: string, _ids: string[], include_doc: boolean = true): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/report/getReportByIds`, { headers: this.httpHeaders, params: { _ids, view, include_doc } })
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
