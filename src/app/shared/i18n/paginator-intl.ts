import { Injectable, effect, inject } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { I18n } from './i18n.service';

/** Paginator labels in the current language. */
@Injectable()
export class I18nPaginatorIntl extends MatPaginatorIntl {
  private readonly i18n = inject(I18n);

  constructor() {
    super();
    effect(() => {
      this.i18n.lang();
      this.itemsPerPageLabel = this.i18n.t('pager.items');
      this.nextPageLabel = this.i18n.t('pager.next');
      this.previousPageLabel = this.i18n.t('pager.previous');
      this.firstPageLabel = this.i18n.t('pager.first');
      this.lastPageLabel = this.i18n.t('pager.last');
      this.changes.next();
    });
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    const start = length === 0 ? 0 : page * pageSize + 1;
    const end = Math.min((page + 1) * pageSize, length);
    return this.i18n.t('pager.range', { start, end, total: length });
  };
}
