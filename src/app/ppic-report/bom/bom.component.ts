import { Component, Input, signal } from '@angular/core';
import { AppService } from '../../app.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { BomDlgComponent } from './bom-dlg/bom-dlg.component';
import { ConfirmationDlgComponent } from '../../common/confirmation-dlg/confirmation-dlg.component';

@Component({
  selector: 'app-bom',
  templateUrl: './bom.component.html',
  styleUrl: './bom.component.css'
})
export class BomComponent {

  constructor(public appservice: AppService,
    private sb: MatSnackBar,
    private dialog: MatDialog) {
    this.debounceSearch = this.appservice.debounceSearch(this.applyFilter.bind(this), 300);
  }
  debounceSearch: Function;
  @Input() type: string = '';
  pendingBOMDatasource: any[] = [];
  temp_pendingBOMDatasource: any[] = [];
  readonly panelOpenState = signal(false);

  async ngOnInit() {
    this.appservice.saving = true;

    try {
      const response: any[] = await lastValueFrom(this.appservice.GetPendingQtyFiltered('pendingTotalBalanceQty'));
      if (response) {
        const bommaster = await lastValueFrom(this.appservice.GetBOMMaster());
        if (bommaster) {
          this.pendingBOMDatasource = bommaster.bomdata;
        }
        response.forEach(row => {
          let existing_brand = this.pendingBOMDatasource.findIndex(res => res.key == row.key);
          if (existing_brand != -1) {
            if (!this.pendingBOMDatasource[existing_brand].list)
              this.pendingBOMDatasource[existing_brand].list = [];
            this.pendingBOMDatasource[existing_brand].value = row.value;

          }
          else {
            row.list = [];
            this.pendingBOMDatasource.push(row);
          }
        });
        this.temp_pendingBOMDatasource = this.pendingBOMDatasource.slice()
      }
      this.appservice.saving = false;
    } catch (error) {
      this.sb.open("Could not fetch All BOM List", "", {
        duration: 2000
      });
      this.appservice.saving = false;
    }

    if (this.type == 'present_stock') {
      this.appservice.saving = true;
      this.temp_pendingBOMDatasource = []; // using as main ds
      let temp_ds: any = {};
      for (let bom in this.pendingBOMDatasource) {
        for (let row of this.pendingBOMDatasource[bom].list) {
          if (!(row.rm_stock_name in temp_ds)) {
            temp_ds[row.rm_stock_name] = bom;
            row.brand_name_list = [{ brand_name: this.pendingBOMDatasource[bom].key, required_qty: row.required_qty, total_required_tabs: this.pendingBOMDatasource[bom].value }]
            this.temp_pendingBOMDatasource.push({ rm_stock_name: row.rm_stock_name, brand_name_list: row.brand_name_list })
          } else {
            this.temp_pendingBOMDatasource[temp_ds[row.rm_stock_name]].brand_name_list.push({ brand_name: this.pendingBOMDatasource[bom].key, required_qty: row.required_qty, total_required_tabs: this.pendingBOMDatasource[bom].value })
          }
        }
      }
      try {
        const response: any[] = await lastValueFrom(this.appservice.GetLinkingMasterByIds('pm_stock_master' , Object.keys(temp_ds).map(res => res.replace(/[^a-zA-Z0-9]/g, '_'))));
        if (response) {
          response.forEach((res, i) => {
            this.temp_pendingBOMDatasource[i].present_stock = res.doc.present_stock;
            this.temp_pendingBOMDatasource[i].unit = res.doc.unit;
          })
        }
        this.appservice.saving = false;
      } catch (error) {
        this.sb.open("Could not fetch RM Stock List", "", {
          duration: 2000
        });
        this.appservice.saving = false;
      }
    }
  }

  addBOM(bomindex: number) {

    this.dialog.open(BomDlgComponent, {
      width: '80%', height: '90%', data: {}
    }).afterClosed().subscribe(res => {
      if (res) {
        res.required_qty = (res.standard_qty * 100000) / this.temp_pendingBOMDatasource[bomindex].value;
        res.brand_name = this.temp_pendingBOMDatasource[bomindex].key;
        this.temp_pendingBOMDatasource[bomindex].list.push(res);
        this.temp_pendingBOMDatasource[bomindex].list = this.temp_pendingBOMDatasource[bomindex].list.slice();
        this.pendingBOMDatasource = this.temp_pendingBOMDatasource.slice();
        this.addUpdateBOM()
      }
    });
  }
  updateBOM(row: any, index: number, bomindex: number) {
    this.dialog.open(BomDlgComponent, {
      width: '90%', height: '90%', data: { row }
    }).afterClosed().subscribe(res => {
      if (res) {
        res.required_qty = (res.standard_qty * 100000) / this.temp_pendingBOMDatasource[bomindex].value;
        res.brand_name = this.temp_pendingBOMDatasource[bomindex].key;
        this.temp_pendingBOMDatasource[bomindex].list.splice(index, 1, res);
        this.temp_pendingBOMDatasource = this.temp_pendingBOMDatasource.slice();
        this.pendingBOMDatasource = this.temp_pendingBOMDatasource.slice();
        this.addUpdateBOM()
      }
    });
  }
  deleteBOM(row: any, index: number, bomindex: number) {
    this.dialog.open(ConfirmationDlgComponent, {
      width: '250px', closeOnNavigation: true, autoFocus: true,
      data: {
        Question: "Are you Sure..! Do you want to Delete this Entry?",
        YesText: "Yes",
        NoText: "No"
      }
    }).afterClosed().subscribe(async result => {
      if (result) {
        try {
          this.appservice.saving = true;

          const response = await lastValueFrom(this.appservice.UpdateBOMMaster(this.temp_pendingBOMDatasource));
          if (response) {
            this.temp_pendingBOMDatasource[bomindex].list.splice(index, 1);
            this.temp_pendingBOMDatasource = this.temp_pendingBOMDatasource.slice();
            this.pendingBOMDatasource = this.temp_pendingBOMDatasource.slice();
            this.sb.open("ROM Deleted Successfully", "", {
              duration: 2000
            });
          }

          this.appservice.saving = false;
        } catch (error) {
          this.sb.open("Could not Delete ROM", "", {
            duration: 2000
          });
          this.appservice.saving = false;
        }
        this.addUpdateBOM()
      }
    });
  }
  async addUpdateBOM() {
    try {
      this.appservice.saving = true;

      const response: any[] = await lastValueFrom(this.appservice.UpdateBOMMaster({ bomdata: this.pendingBOMDatasource }));
      if (response) {
        
      }
      this.appservice.saving = false;
    } catch (error) {
      this.sb.open("Could not update BOM", "", {
        duration: 2000
      });
      this.appservice.saving = false;
    }
  }
  applyFilter(event: Event, mainDS: any[], tempDS: any[]) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.temp_pendingBOMDatasource = this.pendingBOMDatasource.filter((row) => row.key.toLowerCase().includes(filterValue.trim().toLowerCase())).slice();
  }
}
