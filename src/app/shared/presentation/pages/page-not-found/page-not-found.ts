import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-page-not-found',
  imports: [MatButtonModule, MatIconModule, RouterLink, TranslatePipe],
  template: `
    <section class="page not-found">
      <mat-icon>travel_explore</mat-icon>
      <h2>{{ 'notFound.title' | t }}</h2>
      <p class="muted">{{ 'notFound.text' | t }}</p>
      <a mat-flat-button routerLink="/dashboard"><mat-icon>dashboard</mat-icon> {{ 'notFound.back' | t }}</a>
    </section>
  `,
  styles: `
    .not-found { align-items: center; text-align: center; padding-top: 96px; }
    .not-found > mat-icon { width: 64px; height: 64px; font-size: 64px; color: var(--ic-primary); }
  `,
})
export class PageNotFound {}
