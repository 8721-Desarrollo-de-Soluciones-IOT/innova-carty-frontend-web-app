import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CartStatus } from '../../../../monitoring/domain/model/cart.entity';
import { TranslatePipe } from '../../../i18n/translate.pipe';

const STATUS_VIEW: Record<CartStatus, { icon: string; tone: string }> = {
  IN_SESSION: { icon: 'shopping_cart', tone: 'ok' },
  DISCREPANCY: { icon: 'scale', tone: 'warn' },
  LOCKED: { icon: 'lock', tone: 'err' },
  PAID: { icon: 'verified', tone: 'info' },
  OFFLINE: { icon: 'wifi_off', tone: 'off' },
  AVAILABLE: { icon: 'check', tone: 'off' },
};

/** i18n key of the status label (use it with the t pipe). */
export function cartStatusLabel(status: CartStatus): string {
  return `status.${status}`;
}

@Component({
  selector: 'app-status-chip',
  imports: [MatIconModule, TranslatePipe],
  template: `<span class="chip {{ view().tone }}"><mat-icon>{{ view().icon }}</mat-icon>{{ label() | t }}</span>`,
})
export class StatusChip {
  readonly status = input.required<CartStatus>();
  protected readonly view = computed(() => STATUS_VIEW[this.status()]);
  protected readonly label = computed(() => cartStatusLabel(this.status()));
}
