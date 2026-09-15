import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <h1 class="font-display text-2xl font-semibold">{{ 'nav.plans' | translate }}</h1>
    <p class="text-sm text-slate-500">{{ 'admin.plansSubtitle' | translate }}</p>
    <div class="mt-6 grid gap-4 md:grid-cols-3">
      @for (p of plans(); track p.id) {
        <div class="card space-y-2">
          <p class="text-xs uppercase tracking-wide text-slate-400">{{ p.code }}</p>
          <h2 class="font-display text-xl font-semibold">{{ locale === 'en' ? p.nameEn : p.nameEs }}</h2>
          <p class="text-sm text-slate-500">{{ locale === 'en' ? p.descriptionEn : p.descriptionEs }}</p>
          <p class="text-2xl font-semibold">{{ p.monthlyPrice }} €</p>
          <ul class="text-sm text-slate-500">
            <li>{{ p.maxUsers }} {{ 'admin.users' | translate }}</li>
            <li>{{ p.maxVeterinarians }} {{ 'nav.team' | translate }}</li>
            <li>{{ p.maxBranches }} {{ 'nav.branches' | translate }}</li>
          </ul>
        </div>
      }
    </div>
  `
})
export class AdminPlansPage implements OnInit {
  private api = inject(ApiService);
  private i18n = inject(TranslateService);
  plans = signal<any[]>([]);
  get locale() { return this.i18n.currentLang; }
  ngOnInit() {
    this.api.get<any[]>('/admin/plans').subscribe(p => this.plans.set(p));
  }
}
