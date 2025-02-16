import { Component } from '@angular/core';
import { LocaleService } from './common/locale/locale.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private localeService: LocaleService) {
    this.localeService.init();
  }

}
