import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocaleService {
  public Locale: any = null;
  constructor(public _http: HttpClient, @Inject(LOCALE_ID) protected localeId: string) { }

  async init() {
    if (!this.Locale) {
      try {
        this.Locale = await firstValueFrom(this.getLocaleData());
      } catch (error) {
        console.error('Failed to load locale data:', error);
        this.Locale = null;
      }
    }
  }

  private getLocaleData() {
    const localeFile = this.localeId || 'en-US';
    return this._http.get(`assets/locale/lang_${localeFile}.json`);
  }
}
