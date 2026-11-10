import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';
import { LANGS, Lang, MESSAGES } from './messages';
import { translateServerText } from './server-texts';

const STORAGE_KEY = 'ic-console-lang';

/** Current language of the console (Spanish by default) and text lookup. */
@Injectable({ providedIn: 'root' })
export class I18n {
  private readonly document = inject(DOCUMENT);
  readonly lang = signal<Lang>(I18n.stored() ?? 'es');

  constructor() {
    effect(() => {
      const lang = this.lang();
      this.document.documentElement.lang = lang;
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // Private mode: the choice lasts until the page is closed.
      }
    });
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
  }

  /** UI text by key, with {placeholders}. */
  t(key: string, params?: Record<string, string | number | null | undefined>): string {
    const text = MESSAGES[this.lang()][key] ?? MESSAGES.en[key] ?? key;
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? ''));
  }

  /** Text written by the API (events, alerts, zones) in the current language. */
  server(text: string | null | undefined): string {
    return this.lang() === 'es' ? translateServerText(text) : (text ?? '');
  }

  private static stored(): Lang | null {
    try {
      const value = localStorage.getItem(STORAGE_KEY) as Lang | null;
      return value && LANGS.includes(value) ? value : null;
    } catch {
      return null;
    }
  }
}
