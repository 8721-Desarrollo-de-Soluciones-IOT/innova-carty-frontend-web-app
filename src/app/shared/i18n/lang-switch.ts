import { Component, inject } from '@angular/core';
import { I18n } from './i18n.service';
import { LANGS } from './messages';
import { TranslatePipe } from './translate.pipe';

/** ES | EN selector. */
@Component({
  selector: 'app-lang-switch',
  imports: [TranslatePipe],
  template: `
    <div class="switch" role="group" [attr.aria-label]="'common.language' | t">
      @for (l of langs; track l) {
        <button
          type="button"
          [class.active]="i18n.lang() === l"
          [attr.aria-pressed]="i18n.lang() === l"
          (click)="i18n.setLang(l)"
        >
          {{ l.toUpperCase() }}
        </button>
      }
    </div>
  `,
  styles: `
    .switch {
      display: inline-flex;
      border: 1px solid var(--ic-line, #d9e2ec);
      border-radius: 999px;
      overflow: hidden;
      background: #fff;
    }
    button {
      border: 0;
      background: transparent;
      padding: 6px 12px;
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      color: var(--ic-ink-2, #486581);
      cursor: pointer;
    }
    button.active {
      background: var(--ic-primary, #004f8c);
      color: #fff;
    }
    button:focus-visible {
      outline: 2px solid var(--ic-primary, #004f8c);
      outline-offset: -2px;
    }
  `,
})
export class LangSwitch {
  protected readonly i18n = inject(I18n);
  protected readonly langs = LANGS;
}
