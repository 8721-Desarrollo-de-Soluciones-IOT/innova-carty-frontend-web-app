import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { I18n } from '../../../../shared/i18n/i18n.service';
import { ServerTextPipe, TranslatePipe } from '../../../../shared/i18n/translate.pipe';
import { poll } from '../../../../shared/infrastructure/polling';
import { CartSupervisionService } from '../../../application/cart-supervision.service';
import { ALERT_ICONS, Alert, AlertType, SEVERITY_TONES, isOpen } from '../../../domain/model/alert.entity';
import { AlertsApi } from '../../../infrastructure/monitoring-api';

interface AlertTab {
  /** i18n key. */
  label: string;
  matches: (alert: Alert) => boolean;
}

const byType = (type: AlertType) => (a: Alert) => isOpen(a) && a.type === type;

@Component({
  selector: 'app-alert-list',
  imports: [DatePipe, MatButtonModule, MatIconModule, MatProgressBarModule, MatTabsModule, RouterLink, ServerTextPipe, TranslatePipe],
  templateUrl: './alert-list.html',
  styleUrl: './alert-list.css',
})
export class AlertList {
  private readonly api = inject(AlertsApi);
  private readonly supervision = inject(CartSupervisionService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly i18n = inject(I18n);
  private readonly reload = signal(0);

  private readonly alerts = toSignal(
    toObservable(this.reload).pipe(
      switchMap(() => poll(() => this.api.getAll({ _sort: 'createdAt', _order: 'desc' }).pipe(catchError(() => of(null))))),
    ),
  );

  protected readonly loading = computed(() => this.alerts() === undefined);
  protected readonly failed = computed(() => this.alerts() === null);

  protected readonly tabs: AlertTab[] = [
    { label: 'alerts.tab.open', matches: isOpen },
    { label: 'alerts.tab.geofence', matches: byType('GEOFENCE') },
    { label: 'alerts.tab.weight', matches: byType('WEIGHT') },
    { label: 'alerts.tab.rfid', matches: byType('RFID') },
    { label: 'alerts.tab.devices', matches: byType('DEVICE') },
    { label: 'alerts.tab.resolved', matches: (a) => a.status === 'RESOLVED' },
  ];
  protected readonly selected = signal(0);
  protected readonly counts = computed(() => this.tabs.map((t) => (this.alerts() ?? []).filter(t.matches).length));
  protected readonly visible = computed(() => (this.alerts() ?? []).filter(this.tabs[this.selected()].matches));

  protected readonly icons = ALERT_ICONS;
  protected readonly tones = SEVERITY_TONES;

  protected acknowledge(alert: Alert): void {
    this.supervision.acknowledge(alert).subscribe({
      next: () => {
        this.snackBar.open(this.i18n.t('alerts.ackDone', { id: alert.cartId }), 'OK', { duration: 3000 });
        this.reload.update((n) => n + 1);
      },
      error: () => this.snackBar.open(this.i18n.t('alerts.ackFailed'), 'OK', { duration: 3000 }),
    });
  }
}
