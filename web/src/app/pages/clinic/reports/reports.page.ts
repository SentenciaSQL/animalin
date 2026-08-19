import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <h1 class="font-display text-2xl font-semibold">{{ 'reports.title' | translate }}</h1>
    <p class="text-sm text-slate-500">{{ 'reports.subtitle' | translate }}</p>
    <div class="mt-6 grid gap-4 sm:grid-cols-2">
      <button type="button" class="card text-left hover:border-brand-200" (click)="download('/reports/appointments.xlsx', 'citas.xlsx', true)">{{ 'reports.appointments' | translate }}</button>
      <button type="button" class="card text-left hover:border-brand-200" (click)="download('/reports/owners.csv', 'propietarios.csv')">{{ 'reports.owners' | translate }}</button>
      <button type="button" class="card text-left hover:border-brand-200" (click)="download('/reports/pets.csv', 'mascotas.csv')">{{ 'reports.pets' | translate }}</button>
    </div>
  `
})
export class ReportsPage {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  download(path: string, filename: string, range = false) {
    const params = range ? {
      from: new Date(Date.now() - 30 * 86400000).toISOString(),
      to: new Date().toISOString()
    } : undefined;
    this.api.blob(path, params).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.toast.show('common.error', true)
    });
  }
}
