import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18n } from './i18n.service';

/** {{ 'nav.carts' | t }} or {{ 'cart.order' | t: { id: s.id } }} */
@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18n);

  transform(key: string, params?: Record<string, string | number | null | undefined>): string {
    return this.i18n.t(key, params);
  }
}

/** {{ cart.lastEvent | st }}: text written by the API, shown in the current language. */
@Pipe({ name: 'st', pure: false })
export class ServerTextPipe implements PipeTransform {
  private readonly i18n = inject(I18n);

  transform(text: string | null | undefined): string {
    return this.i18n.server(text);
  }
}
