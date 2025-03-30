import { Component, OnInit, OnChanges, ChangeDetectorRef, NgZone } from '@angular/core';
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
    private zone: NgZone,
    private cdr: ChangeDetectorRef) {
    this.debounceSearch = this.appservice.debounceSearch(this.applyFilter.bind(this), 300);
  }

  async ngOnInit() {
    this.saving = true;

    try {
      let rm_pm_wo: any = {}, rm_all: any = {}, pm_all: any = {};
      const rm_pm_name_list_resp = await lastValueFrom(this.appservice.GetAllLinkingMaster('rmAndpmList'));
      if (rm_pm_name_list_resp) {
        (rm_pm_name_list_resp as any[]).forEach(res => {
          rm_pm_wo[res.id] = res.value; // add all properties of rm/pm
        });
      }
      const response = await lastValueFrom(this.appservice.GetAllFilterReports('pendingOrders', false, null));
      if (response) {
        let brand_name_list: any = {}, wo_wise_pending: any = {};
        (response as any[]).forEach(res => {
          let val = res.value as any;
          brand_name_list[val.brand_name] ??= [];
          brand_name_list[val.brand_name].push(res.id);
          wo_wise_pending[res.id] = { brand_name: val.brand_name, balance_qty: val.balance_qty }; // add wo & balance_qty
        });
        const totalPendingRM = await lastValueFrom(this.appservice.GetAllFilterReports('totalPendingRM', false, null));
        const totalPendingPM = await lastValueFrom(this.appservice.GetAllFilterReports('totalPendingPM', false, null));
        const woPendingRM = await lastValueFrom(this.appservice.GetAllFilterReports('woPendingRM', false, null));
        const woPendingPM = await lastValueFrom(this.appservice.GetAllFilterReports('woPendingPM', false, null));


        if (Object.keys(brand_name_list).length > 0) {
          const brand_masters_resp = await lastValueFrom(this.appservice.GetLinkingMasterByIds('brandStockMaster', Object.keys(brand_name_list)));
          if (brand_masters_resp) {

            (brand_masters_resp as any[]).forEach(res => {
              let doc = res.doc as any;
              for (let wo of brand_name_list[doc.brand_name]) {

                if (doc.rm_item_name_list) {
                  (doc.rm_item_name_list as any[]).forEach(item => {
                    rm_pm_wo[item.rm_item_name] = { ...rm_pm_wo[item.rm_item_name], ...item }; // add calc_offset & rate of rm
                    rm_all[item.rm_item_name] = { ...rm_pm_wo[item.rm_item_name], ...item };   // for all rm ppic list

                    let calc_offset = parseFloat(item.calc_offset);
                    let balance_qty = wo_wise_pending[wo].balance_qty;
                    let required_qty = (balance_qty * calc_offset) / 100000; // calculate pending
                    let transit = 0;
                    try {
                      transit = woPendingRM[0] ? woPendingRM[0].value[wo][item.rm_item_name] : 0;
                    } catch {
                      transit = 0;
                    }
                    if (typeof rm_pm_wo[item.rm_item_name].present_stock == "string") {
                      rm_pm_wo[item.rm_item_name].present_stock = parseInt(rm_pm_wo[item.rm_item_name].present_stock);
                    }

                    rm_pm_wo[item.rm_item_name].required_stock = this.appservice.limitDecimals(required_qty, 4);  // keep 4 precision of float value
                    rm_pm_wo[item.rm_item_name].shortage = this.appservice.limitDecimals((rm_pm_wo[item.rm_item_name].present_stock + transit) - required_qty, 4);
                    if (!rm_pm_wo[item.rm_item_name].shortage)
                      rm_pm_wo[item.rm_item_name].shortage = 0;
                    rm_all[item.rm_item_name].required_stock ??= 0;
                    rm_all[item.rm_item_name].required_stock += rm_pm_wo[item.rm_item_name].required_stock;
                    rm_all[item.rm_item_name].transit = totalPendingRM[0] && totalPendingRM[0].value[item.rm_item_name] ? totalPendingRM[0].value[item.rm_item_name] : 0;

                    rm_all[item.rm_item_name].shortage ??= 0;
                    rm_all[item.rm_item_name].shortage += rm_pm_wo[item.rm_item_name].shortage;

                    if (rm_pm_wo[item.rm_item_name].shortage < 0) {
                      rm_pm_wo[item.rm_item_name].ishighlight = true;
                    }
                    if (rm_all[item.rm_item_name].shortage < 0) {
                      rm_pm_wo[item.rm_item_name].ishighlight = true;
                    }

                    this.ppic_wo_ds.push({ ...rm_pm_wo[item.rm_item_name], item_name: item.rm_item_name, wo: wo, transit: transit });
                  });
                }
                if (doc.pm_item_name_list) {
                  (doc.pm_item_name_list as any[]).forEach(item => {
                    rm_pm_wo[item.pm_item_name] = { ...rm_pm_wo[item.pm_item_name], ...item };  // add calc_offset & rate of pm
                    pm_all[item.pm_item_name] = { ...rm_pm_wo[item.pm_item_name], ...item };   // for all pm ppic list

                    let calc_offset = parseFloat(item.calc_offset);
                    let balance_qty = wo_wise_pending[wo].balance_qty;
                    let required_qty = (balance_qty * calc_offset) / 100000;  // calculate pending
                    let transit = 0;
                    try {
                      transit = woPendingPM[0] ? woPendingPM[0].value[wo][item.pm_item_name] : 0;
                    } catch {
                      transit = 0;
                    }
                    if (typeof rm_pm_wo[item.pm_item_name].present_stock == "string") {
                      rm_pm_wo[item.pm_item_name].present_stock = parseInt(rm_pm_wo[item.pm_item_name].present_stock);
                    }

                    rm_pm_wo[item.pm_item_name].required_stock = this.appservice.limitDecimals(required_qty, 4);  // keep 4 precision of float value
                    rm_pm_wo[item.pm_item_name].shortage = this.appservice.limitDecimals((rm_pm_wo[item.pm_item_name].present_stock + transit) - required_qty, 4);
                    if (!rm_pm_wo[item.pm_item_name].shortage)
                      rm_pm_wo[item.pm_item_name].shortage = 0;

                    pm_all[item.pm_item_name].required_stock ??= 0;
                    pm_all[item.pm_item_name].required_stock += rm_pm_wo[item.pm_item_name].required_stock;
                    pm_all[item.pm_item_name].transit = totalPendingPM[0] && totalPendingPM[0].value[item.pm_item_name] ? totalPendingPM[0].value[item.pm_item_name] : 0;

                    pm_all[item.pm_item_name].shortage ??= 0;
                    pm_all[item.pm_item_name].shortage += rm_pm_wo[item.pm_item_name].shortage;

                    if (rm_pm_wo[item.pm_item_name].shortage < 0) {
                      rm_pm_wo[item.pm_item_name].ishighlight = true;
                    }
                    if (pm_all[item.pm_item_name].shortage < 0) {
                      rm_pm_wo[item.pm_item_name].ishighlight = true;
                    }

                    this.ppic_wo_ds.push({ ...rm_pm_wo[item.pm_item_name], item_name: item.pm_item_name, wo: wo, transit: transit });
                  });
                }
              }
            });
            this.ppic_all_rm = Object.values(rm_all);
            this.ppic_all_pm = Object.values(pm_all);

            this.zone.run(() => {
              this.ppic_wo_ds = this.ppic_wo_ds.slice()
              this.cdr.detectChanges();
            });

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
