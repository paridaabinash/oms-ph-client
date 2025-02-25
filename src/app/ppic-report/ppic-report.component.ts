import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { AppService } from '../app.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-ppic-report',
  templateUrl: './ppic-report.component.html',
  styleUrl: './ppic-report.component.css'
})
export class PpicReportComponent implements OnInit {
  debounceSearch: Function;
  saving = false;
  ppic_all_ds: any[] = [];// MatTableDataSource<any> = new MatTableDataSource<any>();
  ppic_wo_ds: any[] = [];// MatTableDataSource<any> = new MatTableDataSource<any>();

  ppic_all_rm: any[] = [];
  ppic_all_pm: any[] = [];
  activeTabIndex: number = 0;
  shortages_temp: any = {};
  constructor(public appservice: AppService,
    private sb: MatSnackBar,
    private dialog: MatDialog) {
    this.debounceSearch = this.appservice.debounceSearch(this.applyFilter.bind(this), 300);
  }


  async ngOnInit() {
    this.saving = true;

    try {
      const response = await lastValueFrom(this.appservice.GetAllFilterReports('pendingOrders', true, null));
      if (response) {
        let brand_name_list: any = {};
        (response as any[]).forEach(res => {
          let doc = res.doc as any;
          brand_name_list[doc.brand_name] = { wo: doc._id };
        });
        if (Object.keys(brand_name_list).length > 0) {
          const brand_masters_resp = await lastValueFrom(this.appservice.GetLinkingMasterByIds('brandStockMaster', Object.keys(brand_name_list)));
          if (brand_masters_resp) {
            let rm_pm_name_list: any = {};
            (brand_masters_resp as any[]).forEach(res => {
              let doc = res.doc as any;
              if (doc.rm_item_name_list)
                (doc.rm_item_name_list as any[]).forEach(item => rm_pm_name_list[item.rm_item_name] = item);
              if (doc.pm_item_name_list)
                (doc.pm_item_name_list as any[]).forEach(item => rm_pm_name_list[item.pm_item_name] = item);
              
            });
            const rm_pm_name_list_resp = await lastValueFrom(this.appservice.GetLinkingMasterByIds('rmAndpmList', Object.keys(rm_pm_name_list)));
            if (rm_pm_name_list_resp) {
              (rm_pm_name_list_resp as any[]).forEach(res => {
                rm_pm_name_list[res.id].present_stock = res.value.present_stock;
                rm_pm_name_list[res.id].rate = res.value.rate;
              });
            }
            console.log(brand_name_list, rm_pm_name_list);
           


              //if (!(doc.composition_generic_name in comp_obj)) {
              //  comp_obj[doc.composition_generic_name] = this.pendingOrderDatasource.length;

              //  let pending = doc.balance_qty - (doc.wip ? doc.wip : 0);
              //  if (doc.rm_item_name)
              //    for (let rm of doc.rm_item_name) {
              //      let rm_det = (brand_masters_resp as any[]).find(res => res.doc.rm_item_name == rm);
              //      req_stock.push({ rm_item_name: rm, required_stock: (pending * rm_det.doc.rm_calc_offset) / 100000 })


              //      this.shortages_temp[rm] = {
              //        rm_item_name: rm,
              //        required_stock: (pending * rm_det.doc.rm_calc_offset) / 100000
              //      }
              //    }
              //  this.pendingOrderDatasource.push({
              //    composition_generic_name: doc.composition_generic_name, total_qty: doc.qty_in_tabs, total_pending: pending, total_required: req_stock,
              //    table: [{ brand_name: doc.brand_name, qty_in_tabs: doc.qty_in_tabs, pending: pending, required_stock: req_stock.map(obj => obj.required_stock).join(',') }]
              //  })


              //}
              //else {

              //  let pending = doc.balance_qty - (doc.wip ? doc.wip : 0), ind = comp_obj[doc.composition_generic_name],
              //    table = this.pendingOrderDatasource[ind].table;

              //  this.pendingOrderDatasource[ind].total_qty += doc.qty_in_tabs;
              //  this.pendingOrderDatasource[ind].total_pending += pending;
              //  if (doc.rm_item_name)
              //    for (let rm of doc.rm_item_name) {
              //      let rm_det = (brand_masters_resp as any[]).find(res => res.doc.rm_item_name == rm);
              //      req_stock.push({ rm_item_name: rm, required_stock: (pending * rm_det.doc.rm_calc_offset) / 100000 });
              //      let rm_ind = (this.pendingOrderDatasource[ind].total_required as any[]).findIndex(tot => tot.rm_item_name == rm);
              //      if (rm_ind != -1) {
              //        this.pendingOrderDatasource[ind].total_required[rm_ind].required_stock
              //          = (this.pendingOrderDatasource[ind].total_pending * rm_det.doc.rm_calc_offset) / 100000;

              //        this.shortages_temp[rm] = {
              //          rm_item_name: rm,
              //          required_stock: this.pendingOrderDatasource[ind].total_required[rm_ind].required_stock
              //        }
              //      }
              //    }
              //  this.pendingOrderDatasource[ind].table.push({ brand_name: doc.brand_name, qty_in_tabs: doc.qty_in_tabs, pending: pending, required_stock: req_stock.map(obj => obj.required_stock).join(',') });
              //}
            
          }
        }
      }
      this.saving = false;
    } catch (error) {
      this.sb.open("Could not fetch All Reports", "", {
        duration: 2000
      });
      this.saving = false;
    }
  }

  async onTabChange(event: any) {
    //if (event.index == 4) { prev ppic code
    //  this.saving = true;
    //  const response: any[] = await lastValueFrom(this.appservice.GetPendingQtyFiltered('pendingPOQty'));
    //  if (response) {
    //    response.forEach(item => {
    //      if (item.key in this.shortages_temp)
    //        this.shortages_temp[item.key].po_quantity = item.value;
    //    });
    //  }
    //  this.shortagesReportDS = Object.values(this.shortages_temp);
    //  this.saving = false;
    //}
    this.activeTabIndex = event.index;

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    //this.ppic_wo_ds.filter = filterValue.trim().toLowerCase();
    this.ppic_wo_ds.forEach(data => (data.table as MatTableDataSource<any>).filter = filterValue.trim().toLowerCase())
  }

  saveEmitFunc(event: Event) {

  }
}
