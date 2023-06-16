import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import * as locale from 'date-fns/locale';

@Pipe({
  name: 'localTime',
  pure: false,
})
export class LocalTimePipe implements PipeTransform {

  constructor(private translateService: TranslateService) {
  }

  transform(fullDate: string): string {
    const lang = this.translateService.currentLang || this.translateService.defaultLang;
    const date = new Date(fullDate);
    return format(date, 'HH:mm', { locale: locale[lang] });
  }
}
