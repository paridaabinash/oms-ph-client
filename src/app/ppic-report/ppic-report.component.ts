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
  constructor(public appservice: AppService,
    private sb: MatSnackBar,
    private dialog: MatDialog) {
    this.debounceSearch = this.appservice.debounceSearch(this.applyFilter.bind(this), 300);
  }
  debounceSearch: Function;
  saving = false;
  pendingOrderDatasource: any[] = [];
  temp_pendingOrderDatasource: any[] = [];
  shortagesReportDS: any[] = [];
  activeTabIndex: number = 0;
  shortages_temp: any = {};

  async ngOnInit() {
    this.saving = true;

    try {
      const response = await lastValueFrom(this.appservice.GetAllFilterReports('pendingOrders'));
      if (response) {
        let rm_item_list: any = {};
        (response as any[]).map(res => {
          let doc = res.doc as any;
          if (doc.rm_item_name)
            (doc.rm_item_name as string[]).forEach(item => rm_item_list[item.replace(/[^a-zA-Z0-9]/g, '_')] = '');
        });
        const rm_response = await lastValueFrom(this.appservice.GetLinkingMasterByIds('rmMaster', Object.keys(rm_item_list)));
        if (rm_response) {
          let comp_obj: any = {};
          (response as any[]).map(res => {
            let doc = res.doc as any;
            let req_stock = [];
            if (!(doc.composition_generic_name in comp_obj)) {
              comp_obj[doc.composition_generic_name] = this.pendingOrderDatasource.length;

              let pending = doc.balance_qty - (doc.wip ? doc.wip : 0);
              if (doc.rm_item_name)
                for (let rm of doc.rm_item_name) {
                  let rm_det = (rm_response as any[]).find(res => res.doc.rm_item_name == rm);
                  req_stock.push({ rm_item_name: rm, required_stock: (pending * rm_det.doc.rm_calc_offset) / 100000 })


                  this.shortages_temp[rm] = {
                    rm_item_name: rm,
                    required_stock: (pending * rm_det.doc.rm_calc_offset) / 100000
                  }
                }
              this.pendingOrderDatasource.push({
                composition_generic_name: doc.composition_generic_name, total_qty: doc.qty_in_tabs, total_pending: pending, total_required: req_stock,
                table: [{ brand_name: doc.brand_name, qty_in_tabs: doc.qty_in_tabs, pending: pending, required_stock: req_stock.map(obj => obj.required_stock).join(',') }]
              })


            } else {

              let pending = doc.balance_qty - (doc.wip ? doc.wip : 0), ind = comp_obj[doc.composition_generic_name],
                table = this.pendingOrderDatasource[ind].table;

              this.pendingOrderDatasource[ind].total_qty += doc.qty_in_tabs;
              this.pendingOrderDatasource[ind].total_pending += pending;
              if (doc.rm_item_name)
                for (let rm of doc.rm_item_name) {
                  let rm_det = (rm_response as any[]).find(res => res.doc.rm_item_name == rm);
                  req_stock.push({ rm_item_name: rm, required_stock: (pending * rm_det.doc.rm_calc_offset) / 100000 });
                  let rm_ind = (this.pendingOrderDatasource[ind].total_required as any[]).findIndex(tot => tot.rm_item_name == rm);
                  if (rm_ind != -1) {
                    this.pendingOrderDatasource[ind].total_required[rm_ind].required_stock
                      = (this.pendingOrderDatasource[ind].total_pending * rm_det.doc.rm_calc_offset) / 100000;

                    this.shortages_temp[rm] = {
                      rm_item_name: rm,
                      required_stock: this.pendingOrderDatasource[ind].total_required[rm_ind].required_stock
                    }
                  }
                }
              this.pendingOrderDatasource[ind].table.push({ brand_name: doc.brand_name, qty_in_tabs: doc.qty_in_tabs, pending: pending, required_stock: req_stock.map(obj => obj.required_stock).join(',') });
            }
          });
        }
      }
      this.temp_pendingOrderDatasource = this.pendingOrderDatasource.slice();
      this.saving = false;
    } catch (error) {
      this.sb.open("Could not fetch All Reports", "", {
        duration: 2000
      });
      this.saving = false;
    }
  }

  async onTabChange(event: any) {
    if (event.index == 4) {
      this.saving = true;
      const response: any[] = await lastValueFrom(this.appservice.GetPendingQtyFiltered('pendingPOQty'));
      if (response) {
        response.forEach(item => {
          if (item.key in this.shortages_temp)
            this.shortages_temp[item.key].po_quantity = item.value;
        });
      }
      this.shortagesReportDS = Object.values(this.shortages_temp);
      this.saving = false;
    }
    this.activeTabIndex = event.index;

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.temp_pendingOrderDatasource = this.pendingOrderDatasource.filter((row) => row.composition_generic_name.toLowerCase().includes(filterValue.trim().toLowerCase())).slice();
  }

  saveEmitFunc(event: Event) {

  }
}
