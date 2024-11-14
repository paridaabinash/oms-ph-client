import { Component } from '@angular/core';
import { AppService } from '../app.service';


@Component({
  selector: 'app-linking-master',
  templateUrl: './linking-master.component.html',
  styleUrl: './linking-master.component.css'
})
export class LinkingMasterComponent {
  activeTabIndex: number = 0;

  constructor(public appservice: AppService) { }

  onTabChange(event: any) {
    this.activeTabIndex = event.index;
  }
}
