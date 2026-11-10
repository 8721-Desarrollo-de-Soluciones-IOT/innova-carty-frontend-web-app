import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { LangSwitch } from '../../../../shared/i18n/lang-switch';
import { TranslatePipe } from '../../../../shared/i18n/translate.pipe';
import { AuthService } from '../../../infrastructure/auth.service';

@Component({
  selector: 'app-sign-in',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    LangSwitch,
    TranslatePipe,
  ],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [true],
  });
  protected readonly hidePassword = signal(true);
  protected readonly loading = signal(false);
  /** i18n key of the error. */
  protected readonly error = signal<string | null>(null);

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password, remember } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);
    this.auth.signIn({ email, password }, remember).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(SignIn.errorMessage(err.status));
      },
    });
  }

  private static errorMessage(status: number): string {
    if (status === 401) return 'signIn.error401';
    if (status === 403) return 'signIn.error403';
    // Render free plan: the API sleeps after 15 min without requests and takes about a minute to wake up.
    if (status === 0 || status === 502 || status === 503 || status === 504) {
      return 'signIn.errorWaking';
    }
    return 'signIn.errorNetwork';
  }
}
